import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@omenai/shared-utils/src/priceFormatter";
import { getOptimizedImage } from "@omenai/shared-lib/storage/getImageFileView";
import { base_url } from "@omenai/url-config/src/config";

const BoxIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
    />
  </svg>
);

export default function OrderSummary({ order_data }: { order_data: any }) {
  const image_url = getOptimizedImage(
    order_data?.artwork_data.url as string,
    "thumbnail",
    40,
  );

  return (
    <div className="bg-white rounded shadow-[0_4px_20px_-8px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden sticky top-8">
      {/* Header */}
      <div className="bg-dark px-6 py-6 text-white relative overflow-hidden">
        <div className="relative z-10 flex items-center justify-between">
          <h3 className="font-medium text-fluid-xs flex items-center gap-2">
            <BoxIcon className="w-5 h-5 text-white" />
            Order Summary
          </h3>
          <span className="text-white text-xs font-mono bg-white/10 px-2 py-1 rounded">
            #{order_data?.order_id.toUpperCase()}
          </span>
        </div>
        <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white/10 rounded blur-2xl pointer-events-none" />
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="relative aspect-[4/3] rounded overflow-hidden bg-gray-100 shadow-inner mb-6 group">
          <Image
            src={image_url}
            alt={order_data.artwork_data.title}
            fill
            className="object-cover"
          />
          <div className="absolute bottom-3 left-3">
            <Link
              target="__blank"
              href={`${base_url()}/artwork/${order_data.artwork_data.art_id}`}
              className="text-xs font-medium text-white hover:underline drop-shadow-md"
            >
              View Details
            </Link>
          </div>
        </div>

        <div className="space-y-1 mb-6">
          <h4 className="text-fluid-base font-semibold text-gray-900 leading-tight">
            {order_data.artwork_data.title}
          </h4>
          <p className="text-gray-500 font-medium text-fluid-xs">
            {order_data.artwork_data.artist}
          </p>
        </div>

        <div className="space-y-4 border-t border-gray-100 pt-6">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Artwork Value</span>
            <span className="text-lg font-bold text-gray-900">
              {formatPrice(order_data.artwork_data.pricing.usd_price)}
            </span>
          </div>

          <div className="bg-gray-50 rounded p-4 space-y-3">
            <div>
              <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold">
                Destination
              </span>
              <p className="text-sm font-medium text-gray-900 mt-0.5">
                {order_data.shipping_details.addresses.destination.city},{" "}
                {order_data.shipping_details.addresses.destination.country}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
