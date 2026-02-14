"use client";

import { useState } from "react";
import { Collapse } from "@mantine/core";
import { CreateOrderModelTypes } from "@omenai/shared-types";
import Image from "next/image";
import { getOptimizedImage } from "@omenai/shared-lib/storage/getImageFileView";
import { formatPrice } from "@omenai/shared-utils/src/priceFormatter";
import {
  Banknote,
  BanknoteX,
  CheckCheck,
  ChevronDown,
  Info,
  Truck,
  User,
  MapPin,
  Calendar,
  ExternalLink,
} from "lucide-react";
import { renderButtonAction } from "./construct_response";
import { formatISODate } from "@omenai/shared-utils/src/formatISODate";
import { actionStore } from "@omenai/shared-state-store/src/actions/ActionStore";
import Link from "next/link";
import { tracking_url } from "@omenai/url-config/src/config";
import OrderCountdown from "./OrderCountdown";
import { ClipLoader } from "react-spinners";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import InvoiceDrawer from "../../modals/InvoiceModal";

// --------------------------------------------------------------------------
// HELPERS (Preserved Logic)
// --------------------------------------------------------------------------

function getImageUrl(url: string, deletedEntity: boolean) {
  return deletedEntity ? url : getOptimizedImage(url, "thumbnail", 90);
}

function getStatusDescription(
  actionType: string,
  orderAccepted?: string,
  orderDeclineReason?: string,
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
  order_decline_reason?: string;
}) {
  const base =
    "inline-flex items-center gap-x-1 rounded px-3 py-1 text-fluid-xxs font-light";

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

// --------------------------------------------------------------------------
// MAIN COMPONENT
// --------------------------------------------------------------------------

export function OrderCardList({
  orders,
  emptyLabel,
}: {
  orders: CreateOrderModelTypes[];
  emptyLabel: string;
}) {
  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded border border-dashed border-slate-300">
        <p className="text-slate-500 font-medium">{emptyLabel}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {orders.map((order) => (
        <SingleOrderCard key={order.order_id} order={order} />
      ))}
    </div>
  );
}

// --------------------------------------------------------------------------
// INDIVIDUAL CARD COMPONENT
// --------------------------------------------------------------------------

function SingleOrderCard({ order }: { order: CreateOrderModelTypes }) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { toggleDeclineOrderModal, update_current_order_id } = actionStore();

  const { user } = useAuth({ requiredRole: "user" });
  const handleDeclineOrderRequest = () => {
    update_current_order_id(order.order_id, {
      art_id: order.artwork_data.art_id,
      seller_designation: order.seller_designation,
    });
    toggleDeclineOrderModal(true);
  };

  const actionType = renderButtonAction({
    status: order.status,
    payment_status: order.payment_information.status,
    tracking_status: order.shipping_details.shipment_information.tracking.id,
    order_accepted: order.order_accepted.status,
    exhibition_active: !!order.exhibition_status?.is_on_exhibition,
    delivery_status:
      order.shipping_details.shipment_information.tracking.delivery_status,
  });

  const statusDescription = getStatusDescription(
    actionType!,
    order.order_accepted.status,
    order.order_accepted.reason,
  );

  return (
    <div
      className={`group relative bg-white rounded border transition-all duration-300 overflow-hidden ${isOpen ? "border-blue-200 shadow-md ring-1 ring-blue-100" : "border-slate-200 shadow-sm hover:border-slate-300"}`}
    >
      {/* --- Card Header / Trigger --- */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="p-5 cursor-pointer flex flex-col md:flex-row gap-5 items-start md:items-center justify-between"
      >
        <div className="flex gap-4 items-center">
          {/* Image */}
          <div className="relative h-16 w-16 flex-shrink-0 rounded overflow-hidden border border-slate-100 bg-slate-50">
            <Image
              src={getImageUrl(
                order.artwork_data.url,
                order.artwork_data.deletedEntity,
              )}
              alt={order.artwork_data.title}
              fill
              className="object-cover"
            />
          </div>

          {/* Title & ID */}
          <div className="flex flex-col gap-1">
            <h3 className="font-medium text-slate-900 text-fluid-xs leading-tight">
              {order.artwork_data.title}
            </h3>
            <span className="text-xs text-slate-500 font-mono">
              #{order.order_id.slice(-8)}
            </span>
          </div>
        </div>

        {/* Status & Price Section */}
        <div className="flex items-center gap-6 md:gap-8 w-full md:w-auto justify-between md:justify-end">
          <div className="flex flex-col md:items-end gap-1.5">
            {construct_status({
              status: order.status,
              payment_status: order.payment_information.status,
              tracking_status:
                order.shipping_details.shipment_information.tracking.id,
              order_accepted: order.order_accepted.status,
              delivered: order.shipping_details.delivery_confirmed,
              order_decline_reason: order.order_accepted.reason,
            })}
            <p className="text-xs text-slate-500 hidden md:block">
              {statusDescription}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <p className="font-semibold text-slate-900 text-fluid-xs md:text-base">
              {formatPrice(order.artwork_data.pricing.usd_price)}
            </p>
            <div
              className={`h-8 w-8 rounded flex items-center justify-center bg-slate-50 text-slate-400 transition-transform duration-300 ${isOpen ? "rotate-180 bg-slate-100 text-slate-600" : ""}`}
            >
              <ChevronDown size={18} />
            </div>
          </div>
        </div>
      </div>

      {/* --- Collapsible Content --- */}
      <Collapse in={isOpen}>
        <div className="px-5 pb-6 border-t border-slate-100 bg-slate-50/50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-5">
            {/* Detail Columns */}
            <MetaBlock icon={<Calendar size={14} />} label="Order Date">
              {formatISODate(order.createdAt)}
            </MetaBlock>

            <MetaBlock icon={<User size={14} />} label="Buyer Details">
              {order.buyer_details.name}
            </MetaBlock>

            <MetaBlock icon={<MapPin size={14} />} label="Destination">
              {order.shipping_details.addresses.destination.state},{" "}
              {order.shipping_details.addresses.destination.country}
              <span className="block text-xs text-slate-400 font-light mt-0.5"></span>
            </MetaBlock>

            <MetaBlock icon={<Info size={14} />} label="Status Note">
              {statusDescription || "No additional notes"}
            </MetaBlock>
          </div>

          {/* Action Area */}
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
                  <button className="w-fit rounded bg-dark px-5 py-2 text-fluid-xxs font-light text-white hover:opacity-90 transition">
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
                      new Date(order.updatedAt).getTime() + 24 * 60 * 60 * 1000,
                    )
                  }
                  order_id={order.order_id}
                  user_id={user.id}
                />
              </>
            )}

            {order.payment_information.invoice_reference && (
              <div className="w-full flex justify-start lg:justify-end">
                <button
                  onClick={() => setIsDrawerOpen(true)}
                  className="flex items-center gap-x-2 hover:underline bg-slate-100 px-4 py-2 rounded"
                >
                  <span className="w-fit text-fluid-xs font-light text-dark hover:opacity-90 transition">
                    View receipt invoice
                  </span>
                  <ExternalLink size={14} strokeWidth={1.75} />
                </button>
                <InvoiceDrawer
                  isDrawerOpen={isDrawerOpen}
                  setIsDrawerOpen={setIsDrawerOpen}
                  invoiceNumber={order.payment_information.invoice_reference}
                />
              </div>
            )}
          </div>
        </div>
      </Collapse>
    </div>
  );
}

function MetaBlock({
  label,
  children,
  icon,
}: {
  label: string;
  children: React.ReactNode;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-slate-400 font-semibold">
        {icon} {label}
      </span>
      <span className="text-fluid-xs font-medium text-slate-700 leading-snug">
        {children}
      </span>
    </div>
  );
}

function InfoRow({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-x-2 rounded bg-amber-50 px-3 py-2">
      <p className="text-fluid-xxs text-amber-700">{text}</p>
      <ClipLoader size={12} color="#D97706" />
    </div>
  );
}
