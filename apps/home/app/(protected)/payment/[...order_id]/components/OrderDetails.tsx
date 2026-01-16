"use client";
import { getOptimizedImage } from "@omenai/shared-lib/storage/getImageFileView";
import { CreateOrderModelTypes } from "@omenai/shared-types";
import { formatPrice } from "@omenai/shared-utils/src/priceFormatter";
import Image from "next/image";
import PayNowButton from "./PayNowButton";
import { calculatePurchaseGrandTotalNumber } from "@omenai/shared-utils/src/calculatePurchaseGrandTotal";
import { useHighRiskFeatureFlag } from "@omenai/shared-hooks/hooks/useConfigCatFeatureFlag";
import PaymentBlocker from "./PaymentBlocker";

export default function OrderDetails({
  order,
  lock_status,
}: {
  order: CreateOrderModelTypes;
  lock_status: boolean;
}) {
  const { value: isFlutterwavePaymentEnabled } = useHighRiskFeatureFlag(
    "flutterwave_payment_enabled"
  );
  const { value: isStripePaymentEnabled } = useHighRiskFeatureFlag(
    "stripe_payment_enabled"
  );

  const showBlocker =
    (order.seller_designation === "artist" && !isFlutterwavePaymentEnabled) ||
    (order.seller_designation === "gallery" && !isStripePaymentEnabled);

  if (showBlocker) return <PaymentBlocker />;

  // Increased image size logic for better resolution in this larger layout
  const image_href = getOptimizedImage(
    order.artwork_data.url,
    "thumbnail",
    100
  );

  const total_price_number = calculatePurchaseGrandTotalNumber(
    order.artwork_data.pricing.usd_price,
    +order.shipping_details.shipment_information.quote.fees,
    +order.shipping_details.shipment_information.quote.taxes
  );

  // Reusable row for the summary card
  const PriceRow = ({
    label,
    value,
    isTotal = false,
  }: {
    label: string;
    value: string;
    isTotal?: boolean;
  }) => (
    <div
      className={`flex justify-between items-center ${isTotal ? "text-dark mt-4 pt-4 border-t border-slate-300" : "text-slate-600"}`}
    >
      <span
        className={isTotal ? "text-fluid-base font-semibold" : "text-fluid-xs"}
      >
        {label}
      </span>
      <span
        className={
          isTotal
            ? "text-fluid-sm font-bold tracking-tight"
            : "text-text-fluid-base font-medium text-dark"
        }
      >
        {value}
      </span>
    </div>
  );

  return (
    <div className="w-full max-w-[1400px] animate-in fade-in duration-700">
      {/* Page Title */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-fluid-lg font-semibold text-dark tracking-tight">
            Purchase Checkout
          </h1>
          <p className="text-slate-500 text-fluid-xs mt-1">
            Order ID:{" "}
            <span className="font-mono text-xs font-medium bg-gray-100 px-2 py-1 rounded">
              {order.order_id}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></span>
          <span className="text-sm font-medium text-yellow-700 bg-yellow-50 px-3 py-1 rounded-full">
            Payment Pending
          </span>
        </div>
      </div>

      {/* Main Grid Layout: Stacks on mobile, Side-by-Side on LG screens */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* LEFT COLUMN: Context (Artwork & Logistics) */}
        <div className="lg:col-span-7 space-y-8">
          {/* Section 1: The Artwork */}
          <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-300">
            <h2 className="text-fluid-base font-semibold text-dark mb-6 border-b border-slate-300 pb-4">
              Item Details
            </h2>
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="relative w-full sm:w-48 aspect-square flex-shrink-0 rounded-xl overflow-hidden bg-gray-50 border border-slate-300">
                <Image
                  src={image_href}
                  fill
                  alt={order.artwork_data.title}
                  className="object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="flex flex-col justify-center space-y-2">
                <h3 className="text-fluid-sm font-semibold text-dark leading-tight">
                  {order.artwork_data.title}
                </h3>
                <p className="text-fluid-xs text-slate-500 font-normal">
                  {order.artwork_data.artist}
                </p>
              </div>
            </div>
          </section>

          {/* Section 2: Logistics Grid */}
          <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-300">
            <h2 className="text-fluid-base font-semibold text-dark mb-6 border-b border-slate-300 pb-4">
              Shipping & Delivery
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Address */}
              <div>
                <h3 className="text-xs font-medium uppercase tracking-widest text-slate-400 mb-3">
                  Destination
                </h3>
                <div className="text-fluid-xs text-slate-700 space-y-1">
                  <p className="font-medium text-dark">
                    {order.shipping_details.addresses.destination.address_line}
                  </p>
                  <p>
                    {order.shipping_details.addresses.destination.city},{" "}
                    {order.shipping_details.addresses.destination.state}
                  </p>
                  <p>{order.shipping_details.addresses.destination.country}</p>
                  {order.shipping_details.addresses.destination.zip && (
                    <p>{order.shipping_details.addresses.destination.zip}</p>
                  )}
                </div>
              </div>
              {/* Carrier */}
              <div>
                <h3 className="text-xs font-medium uppercase tracking-widest text-slate-400 mb-3">
                  Carrier Method
                </h3>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="1" y="3" width="15" height="13"></rect>
                      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                      <circle cx="5.5" cy="18.5" r="2.5"></circle>
                      <circle cx="18.5" cy="18.5" r="2.5"></circle>
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-fluid-xs text-dark">
                      {order.shipping_details.shipment_information.carrier}
                    </p>
                    <p className="text-sm text-slate-500">
                      Standard insured shipping
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN: The Transaction (Sticky) */}
        <div className="lg:col-span-5 relative">
          <div className="sticky top-8 space-y-6">
            {/* Financial Summary Card */}
            <div className="bg-white rounded-2xl shadow-xl border border-slate-300 overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-slate-300">
                <h2 className="text-fluid-base font-semibold text-dark">
                  Order Summary
                </h2>
              </div>

              <div className="p-6 md:p-8 space-y-4">
                <PriceRow
                  label="Artwork Price"
                  value={formatPrice(order.artwork_data.pricing.usd_price)}
                />
                <PriceRow
                  label="Shipping Cost"
                  value={formatPrice(
                    order.shipping_details.shipment_information.quote.fees
                  )}
                />
                <PriceRow
                  label="Taxes"
                  value={formatPrice(
                    order.shipping_details.shipment_information.quote.taxes
                  )}
                />

                <PriceRow
                  label="Total Due"
                  value={formatPrice(total_price_number)}
                  isTotal
                />

                <p className="text-xs text-slate-400 text-center mt-4">
                  *Secure payment powered by{" "}
                  {order.seller_designation === "artist" ? (
                    <span className="text-amber-600 font-semibold">
                      Flutterwave
                    </span>
                  ) : (
                    <span className="text-purple-600 font-semibold">
                      Stripe
                    </span>
                  )}
                </p>

                <div className="mt-8">
                  <PayNowButton
                    art_id={order.artwork_data.art_id}
                    artwork={order.artwork_data.title}
                    amount={total_price_number}
                    seller_id={order.seller_details.id}
                    lock_status={lock_status}
                    seller_email={order.seller_details.email}
                    seller_name={order.seller_details.name}
                    role_access={order.seller_designation}
                    shipping_cost={
                      +order.shipping_details.shipment_information.quote.fees
                    }
                    tax_fees={
                      +order.shipping_details.shipment_information.quote.taxes
                    }
                    unit_price={order.artwork_data.pricing.usd_price}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
