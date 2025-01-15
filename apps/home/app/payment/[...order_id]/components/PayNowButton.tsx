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
import { IndividualSchemaTypes } from "@omenai/shared-types";

export default function PayNowButton({
  art_id,
  artwork,
  amount,
  seller_id,
  lock_status,
  seller_email,
  seller_name,
}: {
  art_id: string;
  artwork: string;
  amount: number;
  seller_id: string;
  lock_status: boolean;
  seller_email: string;
  seller_name: string;
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
            trans_type: "purchase_payout",
            user_id: (session as IndividualSchemaTypes)?.user_id,
            user_email: (session as IndividualSchemaTypes)?.email,
            art_id,
            seller_email,
            seller_name,
            artwork_name: artwork,
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
              className="w-fit h-[40px] px-4 disabled:cursor-not-allowed disabled:bg-gray-400 disabled:text-dark disabled:border-dark bg-dark text-white text-[14px] hover:bg-white hover:text-dark disabled:hover:border-none hover:border-dark hover:border duration-150 grid place-items-center group"
            >
              {loading ? <LoadSmall /> : "Proceed to payment"}
            </button>
          </Tooltip>
          {lock_status && (
            <CiLock className="absolute right-[-15px] top-[-5px]" />
          )}
        </div>

        <p className="font-normal text-red-600 lg:w-1/2 mt-6 leading-6">
          <span className="text-base font-bold uppercase underline">
            Please note:
          </span>
          <br /> To safeguard your purchase and prevent accidental duplicate
          transactions for this artwork, we utilize a secure queuing system.
          This system allows only one buyer to finalize payment at a time.
          <br />
          In the rare instance you encounter an issue accessing the payment
          portal, you can refresh your page shortly. We&apos;ll inform you of
          the artwork&apos;s availability if the purchase process hasn&apos;t
          been completed by another buyer.
        </p>
      </div>
    </div>
  );
}
