"use client";

import { Accordion } from "@mantine/core";
import { CreateOrderModelTypes } from "@omenai/shared-types";
import Image from "next/image";
import { getOptimizedImage } from "@omenai/shared-lib/storage/getImageFileView";
import { formatPrice } from "@omenai/shared-utils/src/priceFormatter";
import { Banknote, BanknoteX, CheckCheck, Info, Truck } from "lucide-react";
import { renderButtonAction } from "./construct_response";
import { formatISODate } from "@omenai/shared-utils/src/formatISODate";
import { artistActionStore } from "@omenai/shared-state-store/src/artist/actions/ActionStore";
import Link from "next/link";
import { tracking_url } from "@omenai/url-config/src/config";
import { isArtworkExclusiveDate } from "@omenai/shared-utils/src/addDaysToDate";

/* -------------------------------------------------------------------------- */
/*                                   HELPERS                                  */
/* -------------------------------------------------------------------------- */

function getImageUrl(url: string, deletedEntity: boolean) {
  return deletedEntity ? url : getOptimizedImage(url, "thumbnail", 80);
}

function getStatusDescription({
  status,
  payment_status,
  tracking_status,
  order_accepted,
  delivered,
  order_decline_reason,
}: {
  status: string;
  payment_status: string;
  tracking_status: string | null;
  order_accepted: string;
  delivered: boolean;
  order_decline_reason: string;
}) {
  if (order_accepted === "declined") {
    return order_decline_reason;
  }

  if (status === "completed" && delivered) {
    return "This order has been successfully delivered.";
  }

  if (!order_accepted) {
    return "Order awaiting your approval.";
  }

  if (payment_status === "pending" && !tracking_status && order_accepted) {
    return "Waiting for buyer to complete payment.";
  }

  if (payment_status === "completed" && !tracking_status) {
    return "Payment confirmed. Prepare artwork for shipment.";
  }

  if (tracking_status) {
    return "Shipment request processed.";
  }

  return null;
}

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
  tracking_status: string | null;
  order_accepted: string;
  delivered: boolean;
  order_decline_reason: string;
}) {
  const base =
    "inline-flex items-center gap-x-1 rounded-full px-3 py-1 text-fluid-xxs font-medium";

  if (order_accepted === "declined") {
    return (
      <div className="flex flex-col gap-y-1">
        <span className={`${base} bg-red-100 text-red-700`}>
          <BanknoteX size={14} />
          Declined
        </span>
      </div>
    );
  }

  if (status === "completed" && delivered) {
    return (
      <div className="flex flex-col gap-y-1">
        <span className={`${base} bg-emerald-100 text-emerald-700`}>
          <CheckCheck size={14} />
          Fulfilled
        </span>
      </div>
    );
  }

  if (
    status === "processing" &&
    order_accepted === "accepted" &&
    payment_status === "completed" &&
    tracking_status
  ) {
    return (
      <div className="flex flex-col gap-y-1">
        <span className={`${base} bg-blue-100 text-blue-700`}>
          <Truck size={14} />
          In transit
        </span>
      </div>
    );
  }

  if (payment_status === "completed") {
    return (
      <div className="flex flex-col gap-y-1">
        <span className={`${base} bg-green-100 text-green-700`}>
          <Banknote size={14} />
          Paid
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-y-1">
      <span className={`${base} bg-amber-100 text-amber-700`}>
        <Info size={14} />
        Action required
      </span>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                COMPONENT                                   */
/* -------------------------------------------------------------------------- */

export function OrdersGroupAccordion({
  orders,
}: {
  orders: CreateOrderModelTypes[];
}) {
  const { toggleDeclineOrderModal, update_current_order_id } =
    artistActionStore();

  function handleDeclineOrderRequest(
    order_id: string,
    isExclusive: boolean,
    art_id: string,
    seller_designation: "artist" | "gallery"
  ) {
    update_current_order_id(order_id, {
      is_current_order_exclusive: isExclusive,
      art_id,
      seller_designation,
    });
    toggleDeclineOrderModal(true);
  }

  return (
    <Accordion
      variant="unstyled"
      className="flex flex-col gap-4"
      chevronPosition="right"
    >
      {orders.map((order) => {
        const actionType = renderButtonAction({
          status: order.status,
          payment_status: order.payment_information.status,
          tracking_status:
            order.shipping_details.shipment_information.tracking.id,
          order_accepted: order.order_accepted.status,
        });

        const statusDescription = getStatusDescription({
          status: order.status,
          payment_status: order.payment_information.status,
          tracking_status:
            order.shipping_details.shipment_information.tracking.id,
          order_accepted: order.order_accepted.status,
          delivered: order.shipping_details.delivery_confirmed,
          order_decline_reason: order.order_accepted.reason || "Order declined",
        });

        const isExclusive =
          order.artwork_data.exclusivity_status?.exclusivity_type ===
            "exclusive" && isArtworkExclusiveDate(new Date(order.createdAt));

        return (
          <Accordion.Item
            key={order.order_id}
            value={order.order_id}
            className="rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow"
          >
            {/* ------------------ SUMMARY ------------------ */}
            <Accordion.Control className="p-5 hover:bg-slate-50 rounded-2xl">
              <div className="flex justify-between gap-x-4">
                <div className="flex gap-x-4">
                  <Image
                    src={getImageUrl(
                      order.artwork_data.url,
                      order.artwork_data.deletedEntity
                    )}
                    alt={order.artwork_data.title}
                    width={50}
                    height={50}
                    className="rounded-lg w-[50px] h-[50px] object-cover border"
                  />

                  <div className="flex flex-col gap-y-1">
                    <span className="text-fluid-xs font-semibold text-slate-900">
                      {order.artwork_data.title}
                    </span>
                    <span className="text-fluid-xxs text-slate-500">
                      Order #{order.order_id}
                    </span>

                    {statusDescription && (
                      <span className="text-fluid-xxs text-slate-600">
                        {statusDescription}
                      </span>
                    )}

                    {isExclusive &&
                      order.order_accepted.status !== "declined" &&
                      order.status !== "completed" && (
                        <span className="text-fluid-xxs text-amber-600 mt-1">
                          This artwork is currently under exclusivity.
                        </span>
                      )}
                  </div>
                </div>

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
            </Accordion.Control>

            {/* ------------------ DETAILS ------------------ */}
            <Accordion.Panel className="px-5 pb-5">
              <div className="grid grid-cols-2 gap-4 text-fluid-xxs mt-2">
                <Meta label="Price">
                  {formatPrice(order.artwork_data.pricing.usd_price)}
                </Meta>
                <Meta label="Order date">{formatISODate(order.createdAt)}</Meta>
                <Meta label="Buyer">{order.buyer_details.name}</Meta>
                <Meta label="Destination">
                  {order.shipping_details.addresses.destination.state},{" "}
                  {order.shipping_details.addresses.destination.country}
                </Meta>
              </div>

              {/* Actions */}
              <div className="mt-5 flex flex-wrap gap-4">
                {actionType === "track" && (
                  <Link
                    href={`${tracking_url()}?tracking_id=${order.shipping_details.shipment_information.tracking.id}`}
                  >
                    <button className="rounded-full bg-dark px-5 py-2 text-fluid-xxs font-medium text-white hover:opacity-90 transition">
                      Track shipment
                    </button>
                  </Link>
                )}

                {actionType === "action" && (
                  <>
                    <button
                      onClick={() =>
                        handleDeclineOrderRequest(
                          order.order_id,
                          isExclusive,
                          order.artwork_data.art_id,
                          order.seller_designation
                        )
                      }
                      className="rounded-full bg-red-600 px-5 py-2 text-fluid-xxs font-medium text-white hover:bg-red-700 transition"
                    >
                      Decline order
                    </button>

                    <Link href={`/artist/app/orders/quote/${order.order_id}`}>
                      <button className="rounded-full bg-green-600 px-5 py-2 text-fluid-xxs font-medium text-white hover:bg-green-700 transition">
                        Accept order
                      </button>
                    </Link>
                  </>
                )}
              </div>
            </Accordion.Panel>
          </Accordion.Item>
        );
      })}
    </Accordion>
  );
}

/* -------------------------------------------------------------------------- */
/*                               UI HELPERS                                   */
/* -------------------------------------------------------------------------- */

function Meta({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-y-0.5">
      <span className="text-slate-500">{label}</span>
      <span className="font-semibold text-slate-900">{children}</span>
    </div>
  );
}
