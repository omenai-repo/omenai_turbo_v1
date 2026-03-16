import { useState } from "react";
import Image from "next/image";
import { formatPrice } from "@omenai/shared-utils/src/priceFormatter";
import {
  ArrowRight,
  CheckCircle2,
  Loader2,
  MessageSquareText,
  ChevronDown,
} from "lucide-react";
import StatusBadge from "./StatusBadge";
import { getOptimizedImage } from "@omenai/shared-lib/storage/getImageFileView";
import { motion, AnimatePresence } from "framer-motion";

interface ReviewCardProps {
  review: any;
  onResolve: (action: "ACCEPT" | "DECLINE") => void;
  isMutating: boolean;
}

export default function ReviewCard({
  review,
  onResolve,
  isMutating,
}: ReviewCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isActionRequired = review.status === "PENDING_ARTIST_ACTION";
  const { artwork } = review.meta;
  const image_href = getOptimizedImage(artwork.url, "small");

  // Auto-expand if action is required to grab attention
  useState(() => {
    if (isActionRequired) setIsExpanded(true);
  });

  return (
    <div
      className={`bg-white rounded-xl border transition-all duration-200 overflow-hidden ${
        isActionRequired
          ? "border-amber-300 shadow-sm ring-1 ring-amber-50"
          : "border-neutral-200 hover:border-neutral-300 hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
      }`}
    >
      {/* --- ALWAYS VISIBLE HEADER (The "Row") --- */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 p-4 sm:p-5 items-center cursor-pointer select-none group"
      >
        {/* Col 1: Artwork (5 cols) */}
        <div className="flex items-center gap-4 lg:col-span-5 overflow-hidden">
          <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden border border-neutral-100 shrink-0 bg-neutral-100">
            <Image
              src={image_href}
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
                  Omenai Offer
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

      {/* --- THE EXPANDABLE PAYLOAD --- */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="border-t border-neutral-100 bg-neutral-50/50"
          >
            <div className="p-4 sm:p-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Context/Notes Area */}
              <div className="lg:col-span-8">
                {isActionRequired ? (
                  <div className="bg-amber-50 border border-amber-100/50 rounded-lg p-4 flex gap-3 items-start">
                    <MessageSquareText
                      size={18}
                      className="text-amber-600 shrink-0 mt-0.5"
                    />
                    <div>
                      <span className="text-xs font-bold text-amber-900 uppercase tracking-wider block mb-1">
                        Reviewer Notes
                      </span>
                      <p className="text-sm text-amber-900/80 leading-relaxed italic">
                        "
                        {review.review.admin_notes ||
                          "We propose this counter-offer to ensure a rapid sell-through rate based on market traction."}
                        "
                      </p>
                    </div>
                  </div>
                ) : review.status === "PENDING_ADMIN_REVIEW" ? (
                  <p className="text-sm text-neutral-600 bg-white p-4 rounded-lg border border-neutral-200 shadow-sm">
                    Your proof of value (
                    <span className="font-semibold text-dark">
                      {review.artist_review.justification_type.replace(
                        "_",
                        " ",
                      )}
                    </span>
                    ) is currently under review. Expected turnaround is less
                    than 24 hours.
                  </p>
                ) : review.status === "DECLINED_BY_ADMIN" ? (
                  <div className="bg-rose-50 border border-rose-100 rounded-lg p-4">
                    <span className="text-xs font-bold text-rose-900 uppercase tracking-wider block mb-1">
                      Decline Reason
                    </span>
                    <p className="text-sm text-rose-800/90">
                      {review.review.decline_reason}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-neutral-500 italic">
                    No additional actions required for this request.
                  </p>
                )}
              </div>

              {/* Action Buttons Area */}
              <div className="lg:col-span-4 flex flex-col justify-center">
                {isActionRequired && (
                  <div className="flex flex-col gap-2.5 w-full">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onResolve("ACCEPT");
                      }}
                      disabled={isMutating}
                      className="w-full flex justify-center items-center gap-2 bg-dark hover:bg-black text-white px-5 py-3 rounded-lg text-sm font-semibold transition-all shadow-md disabled:opacity-50"
                    >
                      {isMutating ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <CheckCircle2 size={16} />
                      )}
                      Accept & Publish
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onResolve("DECLINE");
                      }}
                      disabled={isMutating}
                      className="w-full flex justify-center items-center gap-2 bg-white hover:bg-neutral-50 border border-neutral-300 text-neutral-700 px-5 py-3 rounded-lg text-sm font-semibold transition-all disabled:opacity-50"
                    >
                      Decline & Cancel Upload
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
