import Image from "next/image";
import { formatPrice } from "@omenai/shared-utils/src/priceFormatter";
import { ArrowRight, ChevronDown } from "lucide-react";
import StatusBadge from "./StatusBadge";

interface ReviewCardHeaderProps {
  artwork: any;
  review: any;
  imageHref: string;
  isActionRequired: boolean;
  isExpanded: boolean;
  onToggle: () => void;
}

export default function ReviewCardHeader({
  artwork,
  review,
  imageHref,
  isActionRequired,
  isExpanded,
  onToggle,
}: ReviewCardHeaderProps) {
  return (
    <div
      onClick={onToggle}
      className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 p-4 sm:p-5 items-center cursor-pointer select-none group"
    >
      {/* Col 1: Artwork (5 cols) */}
      <div className="flex items-center gap-4 lg:col-span-5 overflow-hidden">
        <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden border border-neutral-100 shrink-0 bg-neutral-100">
          <Image
            src={imageHref}
            alt={artwork.title}
            fill
            className="object-cover"
          />
        </div>
        <div className="flex flex-col overflow-hidden min-w-0">
          <h4 className="font-bold text-dark truncate text-sm sm:text-base group-hover:text-amber-700 transition-colors">
            {artwork.title}
          </h4>
          <p className="text-xs text-neutral-500 truncate mt-0.5">
            {artwork.medium} • {artwork.dimensions.height}x
            {artwork.dimensions.width}
          </p>
        </div>
      </div>

      {/* Col 2: High-Level Math (4 cols) */}
      <div className="flex items-center gap-4 lg:col-span-4 w-full justify-between sm:justify-start">
        <div className="flex flex-col">
          <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
            Requested
          </span>
          <span
            className={`text-sm font-bold ${isActionRequired ? "text-neutral-400 line-through" : "text-dark"}`}
          >
            {formatPrice(review.artist_review.requested_price, "USD")}
          </span>
        </div>

        {isActionRequired && (
          <>
            <ArrowRight size={14} className="text-neutral-300 shrink-0" />
            <div className="flex flex-col">
              <span className="text-[10px] font-semibold text-amber-600 uppercase tracking-wider">
                Proposed Market Value
              </span>
              <span className="text-sm font-bold text-dark">
                {formatPrice(review.review.counter_offer_price, "USD")}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Col 3: Status & Expand Toggle (3 cols) */}
      <div className="lg:col-span-3 flex items-center justify-between w-full">
        <StatusBadge status={review.status} />
        <ChevronDown
          size={18}
          className={`text-neutral-400 transition-transform duration-300 ${isExpanded ? "rotate-180" : "rotate-0"}`}
        />
      </div>
    </div>
  );
}
