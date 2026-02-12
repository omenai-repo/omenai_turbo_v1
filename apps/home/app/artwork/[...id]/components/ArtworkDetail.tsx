"use client";
import Dimensions from "./Dimensions";
import { formatPrice } from "@omenai/shared-utils/src/priceFormatter";
import { IoHeartOutline, IoHeart } from "react-icons/io5"; // Added filled heart
import useLikedState from "@omenai/shared-hooks/hooks/useLikedState";
import { useRouter } from "next/navigation";
import { actionStore } from "@omenai/shared-state-store/src/actions/ActionStore";
import { requestPrice } from "@omenai/shared-services/requests/requestPrice";
import { toast } from "sonner";
import { useState } from "react";
import { ArtworkResultTypes } from "@omenai/shared-types";
import { LoadSmall } from "@omenai/shared-ui-components/components/loader/Load";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";

type ArtworkDetailTypes = {
  data: ArtworkResultTypes;
  sessionId: string | undefined;
};

export default function ArtworkDetail({ data, sessionId }: ArtworkDetailTypes) {
  const { likedState, handleLike } = useLikedState(
    data.impressions as number,
    data.like_IDs as string[],
    sessionId,
    data.art_id,
  );

  const [loading, setLoading] = useState(false);
  const [purchase_click_loading, set_click_loading] = useState(false);
  const { toggleLoginModal } = actionStore();
  const router = useRouter();
  const { user, csrf } = useAuth({ requiredRole: "user" });

  async function handleBuyButtonClick() {
    if (sessionId === undefined) toggleLoginModal(true);
    else {
      if (data.pricing.shouldShowPrice === "Yes") {
        set_click_loading(true);
        router.push(`/purchase/${encodeURIComponent(data.art_id)}`);
      } else {
        setLoading(true);
        const artwork_data = {
          title: data.title,
          artist: data.artist,
          art_id: data.art_id,
          url: data.url,
          medium: data.medium,
          pricing: data.pricing,
        };
        const res = await requestPrice(
          artwork_data,
          user.email,
          user.name,
          csrf || "",
        );

        setLoading(false);
        if (res?.isOk) {
          toast.success("Request Sent", {
            description: "Our concierge will contact you shortly.",
            style: { background: "black", color: "white", borderRadius: "0px" },
          });
        } else {
          toast.error("Error", {
            description: res?.message || "Transmission failed.",
            style: { background: "red", color: "white", borderRadius: "0px" },
          });
        }
      }
    }
  }

  const isSoldOut = !data.availability;
  const isPriceHidden = data.pricing.shouldShowPrice !== "Yes";

  return (
    <div className="flex flex-col gap-8">
      {/* 1. HEADER: Title & Artist */}
      <div className="space-y-4">
        <h1 className="font-serif text-2xl sm:text-2xl md:text-3xl lg:text-5xl leading-[0.95] md:leading-[0.9] tracking-tight text-slate-900 text-balance break-words hyphens-auto">
          {data.title}
        </h1>
        <h2 className="font-sans text-lg font-medium text-slate-600">
          {data.artist}
        </h2>
      </div>

      {/* 2. TECHNICAL SPECS ROW */}
      <div className="flex flex-wrap items-center gap-4 border-y border-slate-100 py-4">
        <span className="font-sans text-[10px] uppercase tracking-widest text-slate-500">
          {data.medium}
        </span>
        <span className="h-3 w-[1px] bg-slate-300" />
        <span className="font-sans text-[10px] uppercase tracking-widest text-slate-500">
          {data.year}
        </span>
        <span className="h-3 w-[1px] bg-slate-300" />
        <span className="font-sans text-[10px] uppercase tracking-widest text-slate-500">
          {data.rarity}
        </span>
      </div>

      {/* 3. DIMENSIONS COMPONENT */}
      <Dimensions dimensions={data.dimensions} />

      {/* 4. PRICE & STATUS */}
      <div className="py-4">
        <span className="mb-2 block font-sans text-[9px] uppercase tracking-widest text-slate-400">
          Valuation
        </span>
        {isSoldOut ? (
          <span className="inline-block border border-slate-200 bg-slate-50 px-3 py-1 font-sans text-xs uppercase tracking-widest text-slate-500">
            Sold
          </span>
        ) : (
          <div className="text-3xl font-light text-dark">
            {isPriceHidden
              ? "Price on Request"
              : formatPrice(data.pricing.usd_price)}
          </div>
        )}
      </div>

      {/* 5. ACTION BUTTONS (Architectural) */}
      <div className="flex flex-col gap-4">
        {/* PRIMARY ACTION: Buy / Request */}
        <button
          disabled={loading || isSoldOut || purchase_click_loading}
          onClick={handleBuyButtonClick}
          className="group flex h-14 w-full items-center justify-center gap-3 bg-dark text-white transition-all duration-300 hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500 rounded"
        >
          {loading || purchase_click_loading ? (
            <LoadSmall />
          ) : (
            <span className="font-sans text-xs uppercase tracking-[0.2em]">
              {isSoldOut
                ? "Unavailable"
                : isPriceHidden
                  ? "Inquire for Price"
                  : "Buy Artwork"}
            </span>
          )}
        </button>

        {/* SECONDARY ACTION: Save */}
        <button
          onClick={() => handleLike(!likedState.ids.includes(sessionId || ""))}
          className="group flex h-14 w-full items-center justify-center gap-3 border border-slate-200 bg-white text-dark transition-all duration-300 hover:border-dark rounded-none"
        >
          {sessionId && likedState.ids.includes(sessionId) ? (
            <>
              <span className="font-sans text-xs uppercase tracking-[0.2em]">
                Saved to Collection
              </span>
              <IoHeart className="text-red-600" />
            </>
          ) : (
            <>
              <span className="font-sans text-xs uppercase tracking-[0.2em]">
                Save to Collection
              </span>
              <IoHeartOutline className="text-slate-400 group-hover:text-dark transition-colors" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
