"use client";

import { Accordion } from "@mantine/core";
import { CreateOrderModelTypes } from "@omenai/shared-types";
import Image from "next/image";
import { getOptimizedImage } from "@omenai/shared-lib/storage/getImageFileView";
import { formatPrice } from "@omenai/shared-utils/src/priceFormatter";
import { Banknote, BanknoteX, CheckCheck, Info, Truck } from "lucide-react";

import { renderButtonAction } from "./construct_response";
import { formatISODate } from "@omenai/shared-utils/src/formatISODate";
import Link from "next/link";
import OrderCountdown from "./OrderCountdown";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { ClipLoader } from "react-spinners";
import { tracking_url } from "@omenai/url-config/src/config";

/* -------------------------------------------------------------------------- */
/*                                   HELPERS                                  */
/* -------------------------------------------------------------------------- */

function getImageUrl(url: string, isDeleted: boolean) {
  return isDeleted ? url : getOptimizedImage(url, "thumbnail", 80);
}

function getStatusDescription(
  actionType: string,
  orderAccepted?: string,
  orderDeclineReason?: string
) {
  if (orderAccepted === "declined") {
    return `${orderDeclineReason}`;
  }

  switch (actionType) {
    case "processing":
      return "Payment is currently being processed.";

    case "awaiting_tracking":
      return "Payment confirmed. Shipment is being prepared.";

    case "awaiting_shipment_creation":
      return "Artwork is on exhibition. Shipment will be arranged after it ends.";

    case "track":
      return "Shipment is on the way to you. Track it for more details.";

    case "pay":
      return "Awaiting payment to proceed with this order.";

    case "fulfilled":
      return "This order has been successfully delivered.";

    case "in_review":
      return "Your order is being processed. You’ll receive an update shortly.";
    default:
      return null;
  }
}

function renderOrderStatus({
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
  order_decline_reason?: string;
}) {
  const base =
    "inline-flex items-center gap-x-1 rounded-full px-3 py-1 text-fluid-xxs font-normal";

  if (order_accepted === "declined") {
    return (
      <span className={`${base} bg-red-100 text-red-700`}>
        <BanknoteX size={14} />
        Declined
      </span>
    );
  }

  if (status === "completed" && order_accepted === "accepted" && delivered) {
    return (
      <span className={`${base} bg-emerald-100 text-emerald-700`}>
        <CheckCheck size={14} />
        Fulfilled
      </span>
    );
  }

  if (
    status === "processing" &&
    order_accepted === "accepted" &&
    payment_status === "completed" &&
    tracking_status
  ) {
    return (
      <span className={`${base} bg-blue-100 text-blue-700`}>
        <Truck size={14} />
        In transit
      </span>
    );
  }

  if (
    status === "processing" &&
    order_accepted === "accepted" &&
    payment_status === "completed"
  ) {
    return (
      <span className={`${base} bg-green-100 text-green-700`}>
        <Banknote size={14} />
        Paid
      </span>
    );
  }

  if (
    order_accepted === "accepted" &&
    status === "processing" &&
    payment_status === "pending"
  ) {
    return (
      <span className={`${base} bg-amber-100 text-amber-700`}>
        <Info size={14} />
        Awaiting payment
      </span>
    );
  }
  if (
    status === "processing" &&
    order_accepted === "" &&
    payment_status === "pending"
  ) {
    return (
      <span className={`${base} bg-amber-100 text-amber-700`}>
        <Info size={14} />
        Order in review
      </span>
    );
  }

  return null;
}

/* -------------------------------------------------------------------------- */
/*                                COMPONENT                                   */
/* -------------------------------------------------------------------------- */

export function OrdersGroupAccordion({
  orders,
}: Readonly<{
  orders: CreateOrderModelTypes[];
}>) {
  const { user } = useAuth({ requiredRole: "user" });

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
          exhibition_active: !!order.exhibition_status?.is_on_exhibition,
          delivery_status:
            order.shipping_details.shipment_information.tracking
              .delivery_status,
        });

        const statusDescription = getStatusDescription(
          actionType!,
          order.order_accepted.status,
          order.order_accepted.reason
        );

        return (
          <Accordion.Item
            key={order.order_id}
            value={order.order_id}
            className="rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow"
          >
            {/* ------------------ SUMMARY ------------------ */}
            <Accordion.Control className="p-5 hover:bg-slate-50 rounded-2xl">
              <div className="flex gap-x-4 items-start justify-between">
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
                  </div>
                </div>

                {renderOrderStatus({
                  status: order.status,
                  payment_status: order.payment_information.status,
                  tracking_status:
                    order.shipping_details.shipment_information.tracking.id,
                  order_accepted: order.order_accepted.status,
                  delivered: order.shipping_details.delivery_confirmed,
                  order_decline_reason: order.order_accepted.reason,
                })}
              </div>
            </Accordion.Control>

            {/* ------------------ DETAILS ------------------ */}
            <Accordion.Panel className="px-5 pb-5">
              <div className="mt-2 grid grid-cols-2 gap-4 text-fluid-xxs">
                <Meta label="Price">
                  {formatPrice(order.artwork_data.pricing.usd_price)}
                </Meta>
                <Meta label="Order date">{formatISODate(order.createdAt)}</Meta>
              </div>

              <div className="mt-4 flex flex-col gap-y-3">
                {actionType === "processing" && (
                  <InfoRow text="Payment transaction is currently processing." />
                )}

                {actionType === "awaiting_tracking" && (
                  <InfoRow text="Payment confirmed. Shipment is being prepared." />
                )}

                {actionType === "awaiting_shipment_creation" && (
                  <InfoRow text="Artwork is on exhibition. Shipment will be arranged after it ends." />
                )}

                {actionType === "track" && (
                  <div className="flex justify-between items-center">
                    <Link
                      href={`${tracking_url()}?tracking_id=${order.shipping_details.shipment_information.tracking.id}`}
                    >
                      <button className="w-fit rounded-full bg-dark px-5 py-2 text-fluid-xxs font-normal text-white hover:opacity-90 transition">
                        Track shipment
                      </button>
                    </Link>
                  </div>
                )}

                {actionType === "pay" && (
                  <>
                    {order.payment_information.status === "failed" && (
                      <p className="text-fluid-xxs text-red-600">
                        Previous payment attempt failed. Please try again.
                      </p>
                    )}

                    <OrderCountdown
                      expiresAt={
                        order.hold_status?.hold_end_date ??
                        new Date(
                          new Date(order.updatedAt).getTime() +
                            24 * 60 * 60 * 1000
                        )
                      }
                      order_id={order.order_id}
                      user_id={user.id}
                    />
                  </>
                )}

                {order.payment_information.invoice_reference && (
                  <Link
                    href={`${tracking_url()}?tracking_id=${order.shipping_details.shipment_information.tracking.id}`}
                  >
                    <p className="w-fit underline text-fluid-xxs font-normal text-dark hover:opacity-90 transition">
                      View receipt invoice
                    </p>
                  </Link>
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

function InfoRow({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-x-2 rounded-lg bg-amber-50 px-3 py-2">
      <p className="text-fluid-xxs text-amber-700">{text}</p>
      <ClipLoader size={12} color="#D97706" />
    </div>
  );
}
