"use client";

import { createOrderLock } from "@omenai/shared-services/orders/createOrderLock";
import { Tooltip } from "flowbite-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CiLock } from "react-icons/ci";
import { toast } from "sonner";
import { createStripeCheckoutSession } from "@omenai/shared-services/stripe/createCheckoutSession";
import { createFlwCheckoutSession } from "@omenai/shared-services/flw/createCheckout";
import { LoadSmall } from "@omenai/shared-ui-components/components/loader/Load";
import { base_url } from "@omenai/url-config/src/config";
import { generateAlphaDigit } from "@omenai/shared-utils/src/generateToken";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";

export default function PayNowButton({
  art_id,
  artwork,
  amount,
  seller_id,
  lock_status,
  seller_email,
  seller_name,
  role_access,
  shipping_cost,
  unit_price,
  tax_fees,
}: {
  art_id: string;
  artwork: string;
  amount: number;
  seller_id: string;
  lock_status: boolean;
  seller_email: string;
  seller_name: string;
  role_access: "artist" | "gallery";
  shipping_cost: number;
  unit_price: number;
  tax_fees: number;
}) {
  const router = useRouter();
  const { user } = useAuth({ requiredRole: "user" });
  const [loading, setLoading] = useState(false);
  const url = base_url();
  const { csrf } = useAuth({ requiredRole: "user" });

  async function handleClickPayNow() {
    setLoading(true);
    const get_purchase_lock = await createOrderLock(
      art_id,
      user.id,
      csrf || "",
    );

    if (get_purchase_lock?.isOk) {
      if (get_purchase_lock.data.lock_data.user_id === user.id) {
        let checkout_session_response;
        if (role_access === "artist") {
          const checkout_session = await createFlwCheckoutSession(
            amount,
            { email: user.email },
            user.name,
            generateAlphaDigit(16),
            {
              buyer_id: user.id,
              buyer_email: user.email,
              art_id,
              seller_email,
              seller_name,
              seller_id,
              artwork_name: artwork,
              shipping_cost,
              unit_price,
              tax_fees,
              seller_designation: role_access,
            },
            `${url}/verifyTransaction`,
            csrf || "",
          );
          checkout_session_response = checkout_session;
        } else {
          const checkout_session = await createStripeCheckoutSession(
            artwork,
            amount,
            seller_id,
            {
              buyer_id: user.id,
              buyer_email: user.email,
              art_id,
              seller_email,
              seller_name,
              seller_id,
              artwork_name: artwork,
              shipping_cost,
              unit_price,
              tax_fees,
              seller_designation: role_access,
            },
            `${url}/payment/success`,
            `${url}/payment/cancel?a_id=${art_id}&u_id=${user.id}`,
            csrf || "",
          );
          checkout_session_response = checkout_session;
        }
        if (!checkout_session_response?.isOk) {
          toast.error("Payment Initiation Failed", {
            description:
              "Something went wrong, please try again or contact support",
          });
        } else {
          toast.info("Secure checkout initiated. Redirecting...");
          router.replace(checkout_session_response.url);
        }
      } else {
        toast.error("Checkout Unavailable", {
          description: get_purchase_lock.message,
        });
      }
    }
    setLoading(false);
  }

  return (
    <div className="w-full flex flex-col items-center space-y-6">
      <div className="w-full grid place-items-center">
        <Tooltip
          content="Another transaction is in progress for this artwork. Please refresh in a few minutes."
          style="dark"
          animation="duration-300"
          trigger="hover"
          // Using 'block' and 'w-full' on the Tooltip itself often targets the trigger wrapper
          className={`max-w-[300px] text-xs p-3 leading-relaxed ${!lock_status && "hidden"}`}
        >
          <button
            onClick={handleClickPayNow}
            disabled={lock_status || loading}
            className={`
        w-full h-[48px] px-8 rounded flex items-center justify-center gap-3 transition-all duration-300
        text-sm font-medium tracking-wide 
        ${
          lock_status
            ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
            : "bg-dark text-white hover:bg-gray-900 active:scale-[0.98] shadow-lg shadow-black/10"
        }
        ${loading && "opacity-80 pointer-events-none"}
      `}
          >
            {loading ? (
              <div className="flex items-center gap-3">
                <LoadSmall />
                <span className="animate-pulse">Securing Session...</span>
              </div>
            ) : (
              <>
                {lock_status && <CiLock className="text-xl" />}
                <span>
                  {lock_status ? "Currently Locked" : "Complete Purchase"}
                </span>
              </>
            )}
          </button>
        </Tooltip>
      </div>

      {/* Modernized Disclaimer Box */}
      <div className="w-full bg-blue-50/50 rounded p-4 border border-blue-100">
        <div className="flex gap-3">
          <svg
            className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-blue-900 uppercase tracking-tight">
              Purchase Protection
            </h4>
            <p className="text-xs text-blue-800/80 leading-relaxed">
              We use a secure queuing system to prevent duplicate transactions.
              Only one buyer can initiate payment at a time to ensure your
              purchase is unique and uninterrupted.
            </p>
          </div>
        </div>
      </div>

      {/* Trust Signals / Footer notes */}
      <div className="flex justify-center gap-6 text-slate-400 opacity-70">
        <p className="text-xs text-green-400">Secure SSL Encryption</p>
      </div>
    </div>
  );
}
