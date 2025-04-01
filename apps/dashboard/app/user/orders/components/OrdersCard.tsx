"use client";

import { useSession } from "@omenai/package-provider/SessionProvider";
import { getImageFileView } from "@omenai/shared-lib/storage/getImageFileView";
import { actionStore } from "@omenai/shared-state-store/src/actions/ActionStore";
import {
  PaymentStatusTypes,
  TrackingInformationTypes,
  ShippingQuoteTypes,
  OrderAcceptedStatusTypes,
} from "@omenai/shared-types";
import { getCurrencySymbol } from "@omenai/shared-utils/src/getCurrencySymbol";
import { formatPrice } from "@omenai/shared-utils/src/priceFormatter";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GoIssueClosed } from "react-icons/go";
import { IoClose } from "react-icons/io5";
import { MdInfo, MdOutlineCallToAction } from "react-icons/md";
import { base_url, auth_uri } from "@omenai/url-config/src/config";

type OverviewOrdersCardProps = {
  title: string;
  artist: string;
  price: number;
  order_date: string;
  url: string;
  status: string;
  order_id: string;
  state: "pending" | "history";
  payment_information: PaymentStatusTypes;
  tracking_information: TrackingInformationTypes;
  shipping_quote?: ShippingQuoteTypes;
  delivery_confirmed: boolean;
  order_accepted: OrderAcceptedStatusTypes;
  availability: boolean;
};
export default function OrdersCard({
  title,
  artist,
  price,
  order_date,
  url,
  status,
  order_id,
  payment_information,
  tracking_information,
  delivery_confirmed,
  order_accepted,
  availability,
}: OverviewOrdersCardProps) {
  const image_url = getImageFileView(url, 200);
  const auth_url = auth_uri();
  const currency = getCurrencySymbol("USD");
  const session = useSession();
  const router = useRouter();
  const base_uri = base_url();

  if (session === null || session === undefined)
    router.replace(`${auth_url}/login`);

  const { updateConfirmOrderDeliveryPopup } = actionStore();

  function construct_status(
    status: string,
    payment_status: string,
    tracking_status: string,
    order_accepted: string,
    delivery_confirmed: boolean,
    availability: boolean
  ) {
    if (!availability) {
      return (
        <span className="px-3 py-1 rounded-full bg-[#e0e0e0] flex gap-x-1 items-center w-fit">
          Artwork already purchased by another buyer
        </span>
      );
    } else {
      if (
        status === "processing" &&
        order_accepted === "accepted" &&
        payment_status === "pending" &&
        tracking_status === "" &&
        !delivery_confirmed
      ) {
        return (
          <span className="px-3 py-1 rounded-full bg-amber-100 flex gap-x-1 items-center w-fit">
            <MdInfo />
            Awaiting payment
          </span>
        );
      }
      if (
        status === "processing" &&
        order_accepted === "accepted" &&
        payment_status === "completed" &&
        tracking_status === "" &&
        !delivery_confirmed
      ) {
        return (
          <span className="px-3 py-1 rounded-full bg-green-100 flex gap-x-1 items-center w-fit">
            <GoIssueClosed />
            Payment completed
          </span>
        );
      }
      if (
        status === "processing" &&
        order_accepted === "accepted" &&
        payment_status === "completed" &&
        tracking_status !== "" &&
        !delivery_confirmed
      ) {
        return (
          <span className="px-3 py-1 rounded-full bg-green-200 flex gap-x-1 items-center w-fit">
            <GoIssueClosed />
            Delivery in progress
          </span>
        );
      }
      if (
        status === "processing" &&
        order_accepted === "" &&
        payment_status === "pending" &&
        tracking_status === "" &&
        !delivery_confirmed
      ) {
        return (
          <span className="px-3 py-1 rounded-full bg-amber-200 flex gap-x-1 items-center w-fit">
            <MdInfo />
            Order in review
          </span>
        );
      }
      if (
        status === "completed" &&
        order_accepted === "declined" &&
        !delivery_confirmed
      ) {
        return (
          <span className="px-3 py-1 rounded-full bg-red-200 flex gap-x-1 items-center w-fit">
            <IoClose />
            Order declined by Gallery
          </span>
        );
      }
      if (
        status === "completed" &&
        order_accepted === "accepted" &&
        delivery_confirmed
      ) {
        return (
          <span className="px-3 py-1 rounded-full bg-green-100 flex gap-x-1 items-center w-fit">
            <GoIssueClosed />
            Order has been completed
          </span>
        );
      }
    }
  }

  return (
    <div className="flex md:flex-row flex-col md:justify-between px-5 py-3 w-full">
      <div className=" flex gap-x-3">
        <Image
          src={image_url}
          alt={title}
          height={100}
          width={100}
          className="object-fill object-center rounded-[20px] h-[100px] w-[100px]"
        />
        <div className="flex flex-col sapce-y-1 text-[14px]">
          <p className="text-gray-700 font-medium text-base">{title}</p>
          {/* <span className="text-gray-700 text-[14px]">{artist}</span> */}
          <span className="text-gray-700 text-base font-bold">
            {formatPrice(price, currency)}
          </span>
          <div className="mt-3">
            {construct_status(
              status,
              payment_information.status,
              tracking_information.link,
              order_accepted.status,
              delivery_confirmed,
              availability
            )}
          </div>
        </div>
      </div>
      <div className="flex flex-col md:mt-0 mt-5 text-[14px] md:items-end items-start gap-y-1">
        <span className="text-gray-700 font-medium text-[14px]">
          {order_date}
        </span>
        <span className="text-gray-700 text-[14px] font-medium">
          Order ID: <span className="font-medium">#{order_id}</span>
        </span>

        {!availability ? (
          <button
            disabled
            className="whitespace-nowrap rounded-full bg-dark text-xs text-white disabled:bg-dark/10 disabled:text-[#858585] w-full disabled:cursor-not-allowed h-[40px] px-4 flex gap-x-2 items-center justify-center hover:bg-dark/80"
          >
            <span>No action required</span>
          </button>
        ) : (
          <>
            {payment_information.status === "pending" &&
              status !== "completed" &&
              order_accepted.status === "accepted" && (
                <Link
                  href={`${base_uri}/payment/${order_id}?id_key=${session?.user_id}`}
                >
                  <button className="whitespace-nowrap rounded-full bg-dark text-xs text-white disabled:bg-dark/10 disabled:text-[#858585] w-full disabled:cursor-not-allowed h-[40px] px-4 flex gap-x-2 items-center justify-center hover:bg-dark/80">
                    <span>Pay for this artwork</span>
                  </button>
                </Link>
              )}
            <div className="w-full sm:flex-row flex-col flex items-center gap-2">
              {payment_information.status === "completed" &&
                status !== "completed" &&
                !delivery_confirmed &&
                tracking_information.link !== "" && (
                  <Link href={tracking_information.link} target="_blank">
                    <button className="whitespace-nowrap rounded-full bg-dark disabled:bg-dark/10 disabled:text-[#858585] text-xs w-full text-white disabled:cursor-not-allowed h-[40px] px-4 flex gap-x-2 items-center justify-center hover:bg-dark/80">
                      <span>Track this order</span>
                    </button>
                  </Link>
                )}
              {payment_information.status === "completed" &&
                !delivery_confirmed &&
                tracking_information.link !== "" && (
                  <button
                    onClick={() =>
                      updateConfirmOrderDeliveryPopup(true, order_id)
                    }
                    className="whitespace-nowrap rounded-full bg-green-600 disabled:bg-dark/10 disabled:text-[#858585] text-xs w-full text-white disabled:cursor-not-allowed h-[40px] px-4 flex gap-x-2 items-center justify-center hover:bg-dark/80"
                  >
                    <span>Confirm order delivery</span>
                  </button>
                )}
            </div>

            {payment_information.status === "completed" &&
              order_accepted.status === "accepted" &&
              status !== "completed" &&
              tracking_information.link === "" && (
                <button
                  disabled
                  className="whitespace-nowrap rounded-full bg-dark disabled:bg-dark/10 disabled:text-[#858585] text-xs w-full text-white disabled:cursor-not-allowed h-[40px] px-4 flex gap-x-2 items-center justify-center hover:bg-dark/80"
                >
                  <span>Awaiting tracking information</span>
                </button>
              )}

            {order_accepted.status === "" && (
              <div className="relative flex items-center gap-x-1">
                <button
                  disabled
                  className="whitespace-nowrap rounded-full bg-dark text-xs disabled:cursor-not-allowed w-full disabled:bg-dark/10 disabled:text-[#A1A1A1] text-white h-[40px] px-4 flex gap-x-2 items-center justify-center hover:bg-dark/80"
                >
                  <MdOutlineCallToAction />
                  <span>Order in review</span>
                </button>
              </div>
            )}
            {delivery_confirmed && (
              <div className="relative flex items-center gap-x-1">
                <button
                  disabled
                  className="whitespace-nowrap rounded-full bg-dark text-xs disabled:cursor-not-allowed w-full disabled:bg-dark/10 disabled:text-[#A1A1A1] text-white h-[40px] px-4 flex gap-x-2 items-center justify-center hover:bg-dark/80"
                >
                  <GoIssueClosed />
                  <span>This order has been fulfilled</span>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
