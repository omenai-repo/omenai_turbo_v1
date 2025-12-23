"use client";

import { Accordion } from "@mantine/core";
import { CreateOrderModelTypes } from "@omenai/shared-types";
import Image from "next/image";
import { getOptimizedImage } from "@omenai/shared-lib/storage/getImageFileView";
import { formatPrice } from "@omenai/shared-utils/src/priceFormatter";
import {
  Banknote,
  BanknoteX,
  CheckCheck,
  Info,
  Truck,
} from "lucide-react";

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
  return isDeleted ? url : getOptimizedImage(url, "thumbnail", 40);
}

function renderOrderStatus({status, payment_status, tracking_status, order_accepted, delivered, order_decline_reason}: {
  status: string;
  payment_status: string;
  tracking_status: string | null;
  order_accepted: string;
  delivered: boolean;
  order_decline_reason?: string;
}) {
  if (order_accepted === "declined") {
    return (
        <div className="flex flex-col gap-y-2">
        <span className="px-3 py-1 rounded-full text-fluid-xxs bg-red-200 flex items-center gap-x-1">
          <BanknoteX size={16} />
          Order declined
        </span>
          <span className="text-fluid-xxs text-red-600">
          Reason: {order_decline_reason}
        </span>
        </div>
    );
  }

  if (status === "completed" && order_accepted === "accepted" && delivered) {
    return (
        <span className="px-3 py-1 rounded-full text-fluid-xxs bg-green-100 flex items-center gap-x-1">
        <CheckCheck size={16} />
        Order has been fulfilled
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
        <span className="px-3 py-1 rounded-full text-fluid-xxs bg-green-100 flex items-center gap-x-1">
        <Truck size={16} />
        Delivery in progress
      </span>
    );
  }

  if (
      status === "processing" &&
      order_accepted === "accepted" &&
      payment_status === "completed"
  ) {
    return (
        <span className="px-3 py-1 rounded-full text-fluid-xxs bg-green-100 flex items-center gap-x-1">
        <Banknote size={16} />
        Payment completed
      </span>
    );
  }

  if (
      status === "processing" &&
      order_accepted === "accepted" &&
      payment_status === "pending"
  ) {
    return (
        <span className="px-3 py-1 rounded-full text-fluid-xxs bg-amber-100 flex items-center gap-x-1">
        <Info size={16} />
        Awaiting payment
      </span>
    );
  }

  if (
      status === "processing" &&
      !order_accepted &&
      payment_status === "pending"
  ) {
    return (
        <span className="px-3 py-1 rounded-full text-fluid-xxs bg-amber-100 flex items-center gap-x-1">
        <Info size={16} />
        Order in review
      </span>
    );
  }

  return null;
}

/* -------------------------------------------------------------------------- */
/*                                COMPONENT                                   */
/* -------------------------------------------------------------------------- */

export function OrdersGroupAccordion({orders,}: Readonly<{
  orders: CreateOrderModelTypes[];
}>) {
  const { user } = useAuth({ requiredRole: "user" });

  return (
      <Accordion variant="separated" radius="xl" className="w-full">
        {orders.map((order) => {
          const actionType = renderButtonAction({
            status: order.status,
            payment_status: order.payment_information.status,
            tracking_status:
            order.shipping_details.shipment_information.tracking.id,
            order_accepted: order.order_accepted.status,
            exhibition_active: !!order.exhibition_status?.is_on_exhibition,
          });

          return (
              <Accordion.Item
                  key={order.order_id}
                  value={order.order_id}
                  className="p-3 mb-3"
              >
                <Accordion.Control>
                  <div className="flex gap-x-2 items-center">
                    <Image
                        src={getImageUrl(
                            order.artwork_data.url,
                            order.artwork_data.deletedEntity
                        )}
                        alt={`${order.artwork_data.title} image`}
                        width={50}
                        height={50}
                        className="rounded-full"
                    />
                    <div>
                  <span className="text-fluid-xxs font-semibold">
                    Order ID: #{order.order_id}
                  </span>
                      <span className="text-fluid-xxs text-slate-700">
                    {order.artwork_data.title}
                  </span>
                    </div>
                  </div>
                </Accordion.Control>

                <Accordion.Panel>
                  <div className="flex flex-col gap-y-3">
                    <Row label="Price">
                      {formatPrice(order.artwork_data.pricing.usd_price)}
                    </Row>

                    <Row label="Order date">
                      {formatISODate(order.createdAt)}
                    </Row>

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

                  {/* Action-specific UI */}
                  {actionType === "processing" && (
                      <InfoRow text="Payment transaction is currently processing. Please check back later." />
                  )}

                  {actionType === "awaiting_tracking" && (
                      <InfoRow text="Payment confirmed successfully. Shipment is being prepared." />
                  )}

                  {actionType === "awaiting_shipment_creation" && (
                      <InfoRow text="Artwork is on exhibition. Shipment will be arranged after it ends." />
                  )}

                  {actionType === "track" && (
                      <Link
                          href={`${tracking_url()}?tracking_id=${order.shipping_details.shipment_information.tracking.id}`}
                      >
                        <button className="mt-6 bg-dark text-white px-4 py-2 rounded-full text-fluid-xxs">
                          Track this shipment
                        </button>
                      </Link>
                  )}

                  {actionType === "pay" && (
                      <>
                        {order.payment_information.status === "failed" && (
                            <p className="text-red-700 text-fluid-xxs">
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

function Row({ label, children }: Readonly<{ label: string; children: React.ReactNode }>) {
  return (
      <div className="flex gap-x-6 items-center">
        <span className="text-fluid-xxs">{label}</span>
        <span className="text-fluid-xxs font-semibold">{children}</span>
      </div>
  );
}

function InfoRow({ text }: { text: string }) {
  return (
      <div className="flex gap-x-2 items-center mt-4">
        <p className="text-fluid-xxs text-amber-700">{text}</p>
        <ClipLoader size={14} color="#FFA000" />
      </div>
  );
}
