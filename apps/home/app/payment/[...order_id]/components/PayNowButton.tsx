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
      csrf || ""
    );

    if (get_purchase_lock?.isOk) {
      if (get_purchase_lock.data.lock_data.user_id === user.id) {
        let checkout_session_response;
        console.log(role_access);
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
            },
            `${url}/verifyTransaction`,
            csrf || ""
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
            },
            `${url}/payment/success`,
            `${url}/payment/cancel?a_id=${art_id}&u_id=${user.id}`,
            csrf || ""
          );
          checkout_session_response = checkout_session;
        }
        if (!checkout_session_response?.isOk) {
          toast.error("Error notification", {
            description:
              "Something went wrong, please try again or contact support",
            style: {
              background: "red",
              color: "white",
            },
            className: "class",
          });
        } else {
          toast.info("Checkout session initiated...Redirecting!");
          router.replace(checkout_session_response.url);
        }
      } else {
        toast.error("Error notification", {
          description: get_purchase_lock.message,
          style: {
            background: "red",
            color: "white",
          },
          className: "class",
        });
      }
    }

    setLoading(false);
  }

  return (
    <div className="w-full grid place-items-center h-full">
      <div className="space-y-8 text-center w-full flex flex-col items-center">
        <div className="w-fit relative">
          <Tooltip
            content={
              "Another user has initiated a payment transaction on this artwork. Please refresh your page in a few minutes to confirm the availability of this artwork."
            }
            style="dark"
            animation="duration-500"
            trigger="hover"
            className={`w-[400px] bg-dark text-fluid-xs text-white p-2 relative ${
              !lock_status && "hidden"
            }`}
          >
            <button
              onClick={handleClickPayNow}
              disabled={lock_status || loading}
              className="h-[35px] p-5 rounded w-full flex items-center justify-center gap-3 disabled:cursor-not-allowed disabled:bg-dark/10 disabled:text-[#A1A1A1] bg-dark text-white text-fluid-xs font-normal"
            >
              {loading ? <LoadSmall /> : "Proceed to payment"}
            </button>
          </Tooltip>
          {lock_status && (
            <CiLock className="absolute right-[-15px] top-[-5px]" />
          )}
        </div>

        <p className="font-normal text-red-600 w-full mt-6 leading-6">
          <span className="text-fluid-base font-bold uppercase underline">
            Please note:
          </span>
          <br /> To protect your purchase and prevent duplicate transactions, we
          use a secure queuing system, allowing one buyer to complete payment at
          a time. If you experience issues accessing the payment portal, refresh
          the page. We&apos;ll notify you if the artwork is still available.
        </p>
      </div>
    </div>
  );
}
