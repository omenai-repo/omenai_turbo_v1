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
} from "lucide-react";
import { renderButtonAction } from "./construct_response";
import { formatISODate } from "@omenai/shared-utils/src/formatISODate";
import { actionStore } from "@omenai/shared-state-store/src/actions/ActionStore";
import Link from "next/link";
import { tracking_url } from "@omenai/url-config/src/config";

// --------------------------------------------------------------------------
// HELPERS (Preserved Logic)
// --------------------------------------------------------------------------

function getImageUrl(url: string, deletedEntity: boolean) {
  return deletedEntity ? url : getOptimizedImage(url, "thumbnail", 90);
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
  if (order_accepted === "declined") return order_decline_reason;
  if (status === "completed" && delivered)
    return "This order has been successfully delivered.";
  if (!order_accepted) return "Order awaiting your approval.";
  if (payment_status === "pending" && !tracking_status && order_accepted)
    return "Waiting for buyer to complete payment.";
  if (payment_status === "completed" && !tracking_status)
    return "Payment confirmed. Prepare artwork for shipment.";
  if (tracking_status) return "Shipment request processed.";
  return null;
}

function construct_status({
  status,
  payment_status,
  tracking_status,
  order_accepted,
  delivered,
  order_decline_reason,
}: any) {
  const base =
    "inline-flex items-center gap-x-1.5 rounded-full px-2.5 py-1 text-xs font-medium w-fit border";

  if (order_accepted === "declined") {
    return (
      <span className={`${base} bg-red-50 text-red-700 border-red-200`}>
        <BanknoteX size={14} /> Declined
      </span>
    );
  }
  if (status === "completed" && delivered) {
    return (
      <span
        className={`${base} bg-emerald-50 text-emerald-700 border-emerald-200`}
      >
        <CheckCheck size={14} /> Completed
      </span>
    );
  }
  if (payment_status === "completed" && tracking_status) {
    return (
      <span className={`${base} bg-blue-50 text-blue-700 border-blue-200`}>
        <Truck size={14} /> In transit
      </span>
    );
  }
  if (payment_status === "completed") {
    return (
      <span className={`${base} bg-green-50 text-green-700 border-green-200`}>
        <Banknote size={14} /> Paid
      </span>
    );
  }
  return (
    <span className={`${base} bg-amber-50 text-amber-700 border-amber-200`}>
      <Info size={14} /> Action required
    </span>
  );
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
      <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-300">
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
  const [isOpen, setIsOpen] = useState(false);
  const { toggleDeclineOrderModal, update_current_order_id } = actionStore();

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
  });

  const statusDescription = getStatusDescription({
    status: order.status,
    payment_status: order.payment_information.status,
    tracking_status: order.shipping_details.shipment_information.tracking.id,
    order_accepted: order.order_accepted.status,
    delivered: order.shipping_details.delivery_confirmed,
    order_decline_reason: order.order_accepted.reason || "Order declined",
  });

  return (
    <div
      className={`group relative bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${isOpen ? "border-blue-200 shadow-md ring-1 ring-blue-100" : "border-slate-200 shadow-sm hover:border-slate-300"}`}
    >
      {/* --- Card Header / Trigger --- */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="p-5 cursor-pointer flex flex-col md:flex-row gap-5 items-start md:items-center justify-between"
      >
        <div className="flex gap-4 items-center">
          {/* Image */}
          <div className="relative h-16 w-16 flex-shrink-0 rounded-lg overflow-hidden border border-slate-100 bg-slate-50">
            <Image
              src={getImageUrl(
                order.artwork_data.url,
                order.artwork_data.deletedEntity
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
              className={`h-8 w-8 rounded-full flex items-center justify-center bg-slate-50 text-slate-400 transition-transform duration-300 ${isOpen ? "rotate-180 bg-slate-100 text-slate-600" : ""}`}
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
              <span className="block text-xs text-slate-400 font-normal mt-0.5"></span>
            </MetaBlock>

            <MetaBlock icon={<Info size={14} />} label="Status Note">
              {statusDescription || "No additional notes"}
            </MetaBlock>
          </div>

          {/* Action Area */}
          {(actionType === "track" || actionType === "action") && (
            <div className="mt-8 flex justify-end gap-3 pt-5 border-t border-slate-200/60">
              {actionType === "track" && (
                <Link
                  href={`${tracking_url()}?tracking_id=${order.shipping_details.shipment_information.tracking.id}`}
                >
                  <button className="flex items-center gap-2 rounded-full bg-slate-900 px-6 py-2.5 text-xs font-medium text-white hover:bg-slate-800 transition shadow-sm hover:shadow-md">
                    <Truck size={14} /> Track Shipment
                  </button>
                </Link>
              )}

              {actionType === "action" && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeclineOrderRequest();
                    }}
                    className="rounded-full px-6 py-2.5 text-xs font-medium text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 transition"
                  >
                    Decline Order
                  </button>
                  <Link href={`/gallery/orders/quote/${order.order_id}`}>
                    <button className="flex items-center gap-2 rounded-full bg-blue-600 px-6 py-2.5 text-xs font-medium text-white hover:bg-blue-700 transition shadow-sm hover:shadow-blue-200">
                      Accept Order
                    </button>
                  </Link>
                </>
              )}
            </div>
          )}
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
