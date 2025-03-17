"use client";

import { createOrderLock } from "@omenai/shared-services/orders/createOrderLock";
import { Tooltip } from "flowbite-react";
import { useRouter } from "next/navigation";
import { useContext, useState } from "react";
import { CiLock } from "react-icons/ci";
import { toast } from "sonner";

import { createCheckoutSession } from "@omenai/shared-services/stripe/createCheckoutSession";
import { SessionContext } from "@omenai/package-provider/SessionProvider";
import { LoadSmall } from "@omenai/shared-ui-components/components/loader/Load";
import { base_url, getApiUrl } from "@omenai/url-config/src/config";
import { IndividualSchemaTypes, RoleAccess } from "@omenai/shared-types";

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
  role_access: RoleAccess;
  shipping_cost: number;
  unit_price: number;
  tax_fees: number;
}) {
  const router = useRouter();
  const { session } = useContext(SessionContext);
  const [loading, setLoading] = useState(false);
  const url = base_url();

  async function handleClickPayNow() {
    setLoading(true);
    const get_purchase_lock = await createOrderLock(
      art_id,
      (session as IndividualSchemaTypes)?.user_id
    );

    if (get_purchase_lock?.isOk) {
      if (
        get_purchase_lock.data.lock_data.user_id ===
        (session as IndividualSchemaTypes)?.user_id
      ) {
        const checkout_session = await createCheckoutSession(
          artwork,
          amount,
          seller_id,
          {
            buyer_id: (session as IndividualSchemaTypes)?.user_id,
            buyer_email: (session as IndividualSchemaTypes)?.email,
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
          `${url}/payment/cancel?a_id=${art_id}&u_id=${(session as IndividualSchemaTypes)?.user_id}`
        );

        if (!checkout_session?.isOk) {
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
          router.replace(checkout_session.url);
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
            className={`w-[400px] bg-dark text-[14px] text-white p-2 relative ${
              !lock_status && "hidden"
            }`}
          >
            <button
              onClick={handleClickPayNow}
              disabled={lock_status || loading}
              className="h-[40px] p-6 rounded-full w-full flex items-center justify-center gap-3 disabled:cursor-not-allowed disabled:bg-gray-400 disabled:text-[#A1A1A1] bg-dark text-white text-[14px] font-normal"
            >
              {loading ? <LoadSmall /> : "Proceed to payment"}
            </button>
          </Tooltip>
          {lock_status && (
            <CiLock className="absolute right-[-15px] top-[-5px]" />
          )}
        </div>

        <p className="font-normal text-red-600 w-full mt-6 leading-6">
          <span className="text-base font-bold uppercase underline">
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
