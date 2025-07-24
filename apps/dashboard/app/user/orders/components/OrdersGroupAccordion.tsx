"use client";
import { Accordion } from "@mantine/core";
import { CreateOrderModelTypes } from "@omenai/shared-types";
import Image from "next/image";
import { getImageFileView } from "@omenai/shared-lib/storage/getImageFileView";
import { formatPrice } from "@omenai/shared-utils/src/priceFormatter";
import { Banknote, BanknoteX, CheckCheck, Info, Truck } from "lucide-react";

import { renderButtonAction } from "./construct_response";
import { formatISODate } from "@omenai/shared-utils/src/formatISODate";
import { artistActionStore } from "@omenai/shared-state-store/src/artist/actions/ActionStore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import OrderCountdown from "./OrderCountdown";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";

export function OrdersGroupAccordion({
  orders,
}: {
  orders: CreateOrderModelTypes[];
}) {
  const {
    updateArtistOrderActionModalData,
    toggleDeclineOrderModal,
    update_current_order_id,
  } = artistActionStore();
  // See groceries data above
  const router = useRouter();
  const get_image_url = (url: string) => {
    const image_url = getImageFileView(url, 200);
    return image_url;
  };
  const { user } = useAuth({ requiredRole: "user" });
  function handleDeclineOrderRequest(order_id: string) {
    update_current_order_id(order_id);
    toggleDeclineOrderModal(true);
  }

  function construct_status({
    status,
    payment_status,
    tracking_status,
    order_accepted,
    delivered,
  }: {
    status: string;
    payment_status: string;
    tracking_status: string;
    order_accepted: string;
    delivered: boolean;
  }) {
    if (
      status === "processing" &&
      order_accepted === "accepted" &&
      payment_status === "pending" &&
      tracking_status === ""
    ) {
      return (
        <span className="px-3 py-1 rounded-xl text-fluid-xs font-medium bg-amber-100 flex gap-x-1 items-center w-fit">
          <Info strokeWidth={1.5} absoluteStrokeWidth size={20} />
          Awaiting payment
        </span>
      );
    }
    if (
      status === "processing" &&
      order_accepted === "accepted" &&
      payment_status === "completed" &&
      tracking_status === ""
    ) {
      return (
        <span className="px-3 py-1 rounded-xl text-fluid-xs font-medium bg-green-100 flex gap-x-1 items-center w-fit">
          <Banknote strokeWidth={1.5} absoluteStrokeWidth size={20} />
          Payment completed
        </span>
      );
    }
    if (
      status === "processing" &&
      order_accepted === "accepted" &&
      payment_status === "completed" &&
      tracking_status !== ""
    ) {
      return (
        <span className="px-3 py-1 rounded-xl text-fluid-xs font-medium bg-green-100 flex gap-x-1 items-center w-fit">
          <Truck strokeWidth={1.5} absoluteStrokeWidth size={20} />
          Delivery in progress
        </span>
      );
    }
    if (
      status === "processing" &&
      order_accepted === "" &&
      payment_status === "pending" &&
      tracking_status === ""
    ) {
      return (
        <span className="px-3 py-1 rounded-xl text-fluid-xs font-medium bg-amber-100 flex gap-x-1 items-center w-fit">
          <Info strokeWidth={1.5} absoluteStrokeWidth size={20} />
          Order in review
        </span>
      );
    }
    if (status === "completed" && order_accepted === "declined") {
      return (
        <span className="px-3 py-1 rounded-xl text-fluid-xs font-medium bg-red-200 flex gap-x-1 items-center w-fit">
          <BanknoteX strokeWidth={1.5} absoluteStrokeWidth size={20} />
          Order declined
        </span>
      );
    }

    if (status === "completed" && order_accepted === "accepted" && delivered) {
      return (
        <span className="px-3 py-1 rounded-xl text-fluid-xs font-medium bg-green-100 flex gap-x-1 items-center w-fit">
          <CheckCheck strokeWidth={1.5} absoluteStrokeWidth size={20} />
          Order has been fulfilled
        </span>
      );
    }
  }

  const items = orders.map((order) => (
    <Accordion.Item
      key={order.order_id}
      value={order.order_id}
      className="p-3 mb-3"
    >
      <Accordion.Control>
        <div className="flex gap-x-2 items-center">
          <Image
            src={get_image_url(order.artwork_data.url)}
            alt={`${order.artwork_data.title} image`}
            width="50"
            height="50"
            className="object-fill object-center h-[50px] w-[50px] rounded-lg"
            loading="lazy"
          />
          <div className="flex flex-col">
            <span className="text-fluid-xs font-semibold">
              Order ID: #{order.order_id}
            </span>
            <span className="text-fluid-xs text-gray-500">
              {order.artwork_data.title}
            </span>
          </div>
        </div>
      </Accordion.Control>
      <Accordion.Panel>
        <div className="flex flex-col gap-y-3">
          <div className="flex gap-x-6 items-center">
            <span className="text-fluid-xs font-normal">Price</span>
            <span className="text-fluid-xs font-semibold text-dark">
              {formatPrice(order.artwork_data.pricing.usd_price)}
            </span>
          </div>

          <div className="flex gap-x-6 items-center">
            <span className="text-fluid-xs font-normal">Order date</span>
            <span className="text-fluid-xs font-medium text-dark">
              {formatISODate(order.createdAt)}
            </span>
          </div>
          <div className="flex gap-x-6 items-center">
            <span className="text-fluid-xs font-normal">Status</span>
            {construct_status({
              status: order.status,
              payment_status: order.payment_information.status,
              tracking_status:
                order.shipping_details.shipment_information.tracking.id,
              order_accepted: order.order_accepted.status,
              delivered: order.shipping_details.delivery_confirmed,
            })}
          </div>
          {/* {order.status === "completed" && (
            <p className="px-1 py-4 text-fluid-xs font-medium text-dark">
              {formatIntlDateTime(order.updatedAt)}
            </p>
          )} */}
        </div>

        {renderButtonAction({
          status: order.status,
          payment_status: order.payment_information.status,
          tracking_status:
            order.shipping_details.shipment_information.tracking.id,
          order_accepted: order.order_accepted.status,
        }) === null && null}
        {renderButtonAction({
          status: order.status,
          payment_status: order.payment_information.status,
          tracking_status:
            order.shipping_details.shipment_information.tracking.id,
          order_accepted: order.order_accepted.status,
        }) === "track" && (
          <div className="mt-6">
            <Link href={`/user/orders/tracking/${order.order_id}`}>
              <button className="hover:bg-dark/70 hover:text-white focus:ring ring-1 border-0 ring-dark/20 hover:ring-dark duration-300 outline-none focus:outline-none text-white focus:ring-dark rounded-xl h-[35px] py-2 px-4 w-fit text-center text-fluid-xs flex items-center justify-center bg-dark cursor-pointer">
                Track this shipment
              </button>
            </Link>
          </div>
        )}
        {renderButtonAction({
          status: order.status,
          payment_status: order.payment_information.status,
          tracking_status:
            order.shipping_details.shipment_information.tracking.id,
          order_accepted: order.order_accepted.status,
        }) === "pay" && (
          <div className="mt-5 flex sm:flex-row flex-col sm:justify-between sm:items-center gap-3">
            <OrderCountdown
              expiresAt={
                order.hold_status === null
                  ? new Date(
                      new Date(order.updatedAt).getTime() + 24 * 60 * 60 * 1000
                    )
                  : order.hold_status.hold_end_date
              }
              order_id={order.order_id}
              user_id={user.id}
            />
          </div>
        )}
      </Accordion.Panel>
    </Accordion.Item>
  ));

  return (
    <Accordion variant="separated" radius="md" className="w-full">
      {items}
    </Accordion>
  );
}
