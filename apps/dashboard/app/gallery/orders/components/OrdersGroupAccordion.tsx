"use client";
import { Accordion } from "@mantine/core";
import {
  AddressTypes,
  ArtworkSchemaTypes,
  CreateOrderModelTypes,
} from "@omenai/shared-types";
import Image from "next/image";
import {
  getImageFileView,
  getOptimizedImage,
} from "@omenai/shared-lib/storage/getImageFileView";
import { formatPrice } from "@omenai/shared-utils/src/priceFormatter";
import { Banknote, BanknoteX, CheckCheck, Info, Truck } from "lucide-react";
import { renderButtonAction } from "./construct_response";
import { formatISODate } from "@omenai/shared-utils/src/formatISODate";
import { useRouter } from "next/navigation";
import { actionStore } from "@omenai/shared-state-store/src/actions/ActionStore";
import Link from "next/link";

export function OrdersGroupAccordion({
  orders,
}: {
  orders: CreateOrderModelTypes[];
}) {
  const {
    updateGalleryOrderActionModalData,
    toggleDeclineOrderModal,
    update_current_order_id,
  } = actionStore();

  const router = useRouter();

  const get_image_url = (url: string) => {
    const image_url = getOptimizedImage(url, "thumbnail", 40);
    return image_url;
  };

  const handleDeclineOrderRequest = (order_id: string) => {
    update_current_order_id(order_id);
    toggleDeclineOrderModal(true);
  };

  function construct_status({
    status,
    payment_status,
    tracking_status,
    order_accepted,
    delivered,
    order_decline_reason,
  }: {
    status: string;
    payment_status: string;
    tracking_status: string;
    order_accepted: string;
    delivered: boolean;
    order_decline_reason: string;
  }) {
    if (
      status === "processing" &&
      order_accepted === "accepted" &&
      payment_status === "pending" &&
      tracking_status === ""
    ) {
      return (
        <span className="px-3 py-1 rounded text-fluid-xs font-normal bg-amber-100 flex gap-x-1 items-center w-fit">
          <Info strokeWidth={1.5} absoluteStrokeWidth />
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
        <span className="px-3 py-1 rounded text-fluid-xs font-normal bg-green-100 flex gap-x-1 items-center w-fit">
          <Banknote strokeWidth={1.5} absoluteStrokeWidth />
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
        <span className="px-3 py-1 rounded text-fluid-xs font-normal bg-green-100 flex gap-x-1 items-center w-fit">
          <Truck strokeWidth={1.5} absoluteStrokeWidth />
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
        <span className="px-3 py-1 rounded text-fluid-xs font-normal bg-amber-100 flex gap-x-1 items-center w-fit">
          <Info strokeWidth={1.5} absoluteStrokeWidth />
          Action required
        </span>
      );
    }
    if (order_accepted === "declined") {
      return (
        <div className="flex flex-col gap-y-2">
          <span className="px-3 py-1 rounded text-fluid-xs font-normal bg-red-200 flex gap-x-1 items-center w-fit">
            <BanknoteX strokeWidth={1.5} absoluteStrokeWidth size={16} />
            Order declined
          </span>
          <span className=" rounded text-fluid-xs font-normal text-red-600 flex items-center w-fit">
            Reason: {order_decline_reason}
          </span>
        </div>
      );
    }

    if (status === "completed" && order_accepted === "accepted" && delivered) {
      return (
        <span className="px-3 py-1 rounded text-fluid-xs font-normal bg-green-100 flex gap-x-1 items-center w-fit">
          <CheckCheck strokeWidth={1.5} absoluteStrokeWidth />
          Order has been fulfilled
        </span>
      );
    }
  }

  const items = orders.map((order) => (
    <Accordion.Item
      key={order.order_id}
      value={order.order_id}
      className="p-5 mb-5"
    >
      <Accordion.Control>
        <div className="flex gap-x-2 items-center">
          <Image
            src={get_image_url(order.artwork_data.url)}
            alt={`${order.artwork_data.title} image`}
            width="50"
            height="50"
            className="object-fill object-center h-[50px] w-[50px] rounded"
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
            <span className="text-fluid-xs font-normal">Buyer name:</span>
            <span className="text-fluid-xs font-normal text-dark">
              {order.buyer_details.name}
            </span>
          </div>
          <div className="flex gap-x-6 items-center">
            <span className="text-fluid-xs font-normal">Buyer address:</span>
            <span className="text-fluid-xs font-normal text-dark">
              {`${order.shipping_details.addresses.destination.state}, 
                ${order.shipping_details.addresses.destination.country}`}
            </span>
          </div>
          <div className="flex gap-x-6 items-center">
            <span className="text-fluid-xs font-normal">Order date:</span>
            <span className="text-fluid-xs font-normal text-dark">
              {formatISODate(order.createdAt)}
            </span>
          </div>
          <div className="flex gap-x-6 items-center">
            <span className="text-fluid-xs font-normal">Status:</span>
            {construct_status({
              status: order.status,
              payment_status: order.payment_information.status,
              tracking_status:
                order.shipping_details.shipment_information.tracking.id,
              order_accepted: order.order_accepted.status,
              delivered: order.shipping_details.delivery_confirmed,
              order_decline_reason:
                order.order_accepted.reason || "Order declined",
            })}
          </div>
          {/* {order.status === "completed" && (
            <p className="px-1 py-4 text-fluid-xs font-normal text-dark">
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
          <div className="mt-5">
            <Link href={`/gallery/orders/tracking/${order.order_id}`}>
              <button className="hover:bg-dark/70 hover:text-white focus:ring ring-1 border-0 ring-dark/20 hover:ring-dark duration-300 outline-none focus:outline-none text-white focus:ring-dark rounded h-[35px] py-2 px-4 w-fit text-center text-fluid-xs flex items-center justify-center bg-dark cursor-pointer">
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
        }) === "action" && (
          <div className="mt-5 flex items-center gap-x-6">
            <button
              onClick={() => handleDeclineOrderRequest(order.order_id)}
              className="hover:bg-red-600/70 hover:text-white focus:ring ring-1 border-0 ring-dark/20 hover:ring-dark duration-300 outline-none focus:outline-none text-white focus:ring-dark rounded h-[35px] py-2 px-4 w-fit text-center text-fluid-xs flex items-center justify-center bg-red-600 cursor-pointer"
            >
              Decline order
            </button>
            <Link href={`/gallery/orders/quote/${order.order_id}`}>
              <button className="hover:bg-green-600/70 hover:text-white focus:ring ring-1 border-0 ring-dark/20 hover:ring-dark duration-300 outline-none focus:outline-none text-white focus:ring-dark rounded h-[35px] py-2 px-4 w-fit text-center text-fluid-xs flex items-center justify-center bg-green-600 cursor-pointer">
                Accept order
              </button>
            </Link>
          </div>
        )}
      </Accordion.Panel>
    </Accordion.Item>
  ));

  return (
    <Accordion variant="separated" radius={"md"} className="w-full">
      {items}
    </Accordion>
  );
}
