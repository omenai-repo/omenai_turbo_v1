import Image from "next/image";
import { formatPrice } from "@omenai/shared-utils/src/priceFormatter";
import { Info, TrendingDown, Activity, TrendingUp } from "lucide-react";

interface ArtworkContextHeaderProps {
  artwork: any;
  artistId: string;
  imageHref: string;
  algorithmRecommendation: any;
  requestedPrice: number;
  onOpenDrawer: () => void;
}

export default function ArtworkContextHeader({
  artwork,
  artistId,
  imageHref,
  algorithmRecommendation,
  requestedPrice,
  onOpenDrawer,
}: ArtworkContextHeaderProps) {
  const variancePercentage = (
    ((requestedPrice - algorithmRecommendation.recommendedPrice) /
      algorithmRecommendation.recommendedPrice) *
    100
  ).toFixed(1);

  return (
    <div className="p-6 lg:p-10 border-b border-neutral-100 flex flex-col md:flex-row gap-8 items-start">
      <div className="relative w-48 h-48 rounded bg-neutral-100 shrink-0 overflow-hidden shadow-sm">
        <Image
          src={imageHref}
          alt={artwork.title}
          fill
          className="object-cover"
        />
      </div>
      <div className="flex-1 space-y-6 w-full">
        <div className="flex justify-between items-start w-full">
          <div>
            <h2 className="text-2xl font-bold text-dark">{artwork.title}</h2>
            <p className="text-sm text-neutral-500 mt-1">
              Artist ID: {artistId}
            </p>
          </div>
          <button
            onClick={onOpenDrawer}
            className="shrink-0 flex items-center gap-2 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold rounded -md transition-colors"
          >
            <Info size={14} /> Full Artwork Metadata
          </button>
        </div>

        {/* Price Math Comparison */}
        <div className="flex flex-col sm:flex-row gap-4 p-5 bg-neutral-50 rounded -xl border border-neutral-200">
          <div className="flex-1">
            <p className="text-xs font-semibold text-neutral-400 uppercase">
              Algorithm Recommendation
            </p>
            <p className="text-xl font-bold text-dark">
              {formatPrice(algorithmRecommendation.recommendedPrice, "USD")}
            </p>
          </div>
          <div className="hidden sm:block w-px bg-neutral-200" />
          <div className="flex-1">
            <p className="text-xs font-semibold text-neutral-400 uppercase">
              Artist Request
            </p>
            <p className="text-xl font-bold text-amber-600">
              {formatPrice(requestedPrice, "USD")}
            </p>
            <p className="text-xs font-medium text-amber-600/70 mt-1">
              {variancePercentage}% variance
            </p>
          </div>
        </div>

        {/* Detailed Algorithm Insights */}
        <div className="grid grid-cols-3 gap-3 border-t border-neutral-100 pt-5 w-full place-items-center">
          <div>
            <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider flex items-center gap-1 mb-1">
              <TrendingDown size={12} /> Low End
            </p>
            <p className="text-sm font-semibold text-neutral-700">
              {formatPrice(algorithmRecommendation.priceRange[0], "USD")}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider flex items-center gap-1 mb-1">
              <Activity size={12} /> Market Mean
            </p>
            <p className="text-sm font-semibold text-neutral-700">
              {formatPrice(algorithmRecommendation.meanPrice, "USD")}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider flex items-center gap-1 mb-1">
              <TrendingUp size={12} /> High End
            </p>
            <p className="text-sm font-semibold text-neutral-700">
              {formatPrice(algorithmRecommendation.priceRange[4], "USD")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
