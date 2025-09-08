"use client";
import Dimensions from "./Dimensions";
import { GrCertificate } from "react-icons/gr";
import { formatPrice } from "@omenai/shared-utils/src/priceFormatter";
import { IoHeartOutline } from "react-icons/io5";
import { GiCheckMark } from "react-icons/gi";
import useLikedState from "@omenai/shared-hooks/hooks/useLikedState";
import { useRouter } from "next/navigation";
import { actionStore } from "@omenai/shared-state-store/src/actions/ActionStore";
import { requestPrice } from "@omenai/shared-services/requests/requestPrice";
import { toast } from "sonner";
import { useState } from "react";
import { PiFrameCornersThin } from "react-icons/pi";

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
    data.art_id
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
        router.push(`/purchase/${encodeURIComponent(data.title)}`);
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
          csrf || ""
        );

        if (res?.isOk) {
          toast.success("Operation successful", {
            description: "Price data sent. Please check your email inbox",
            style: {
              background: "green",
              color: "white",
            },
            className: "class",
          });
          setLoading(false);
        } else {
          console.log(res);
          toast.error("Error notification", {
            description:
              res?.message ||
              "Something went wrong, please try again or contact us for assistance.",
            style: {
              background: "red",
              color: "white",
            },
            className: "class",
          });
          setLoading(false);
        }
      }
    }
  }
  return (
    <div className="flex flex-col gap-y-4">
      <div className="text-dark">
        <h1 className="text-fluid-lg sm:text-fluid-xl font-bold text-gray-900 leading-tight">
          {data.title}
        </h1>
        <h2 className="text-fluid-base font-medium text-gray-600 italic">
          by {data.artist}
        </h2>
      </div>
      {/* Medium and Rarity */}
      <div className="flex items-center space-x-6 text-sm font-medium text-gray-700">
        <span className="px-3 py-1 bg-gray-50 rounded-lg border border-gray-200">
          {data.medium}
        </span>
        <div className="w-px h-4 bg-gray-300" />
        <span className="px-3 py-1 bg-gray-50 rounded-lg border border-gray-200">
          {data.rarity}
        </span>
      </div>

      <Dimensions dimensions={data.dimensions} />
      {/* Certificates and Features */}
      <div className="flex flex-wrap gap-3">
        {data.certificate_of_authenticity === "Yes" && (
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-md text-sm font-medium border border-emerald-200">
            <GrCertificate className="w-4 h-4" />
            <span>Certificate of authenticity</span>
          </div>
        )}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-md text-sm font-medium border border-blue-200">
          <PiFrameCornersThin className="w-4 h-4" />
          <span>
            {data.framing === "Framed"
              ? "Frame included"
              : "Frame not included"}
          </span>
        </div>
      </div>

      <div className="py-4 border-t border-gray-100">
        <div className="space-y-1">
          <p className="text-fluid-xs text-gray-500 uppercase tracking-wide font-medium">
            Price
          </p>
          {!data.availability ? (
            <div className="inline-flex items-center px-3 py-1 bg-red-50 text-red-700 rounded-lg border border-red-200 font-medium">
              Sold Out
            </div>
          ) : (
            <h2 className="text-fluid-md font-bold text-gray-900">
              {data.pricing.shouldShowPrice === "Yes"
                ? formatPrice(data.pricing.usd_price)
                : "Price on request"}
            </h2>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-y-3 font-normal w-full text-fluid-xs">
        <button
          disabled={loading || !data.availability || purchase_click_loading}
          onClick={handleBuyButtonClick}
          className="w-full bg-dark h-[50px] px-4 rounded-md text-white hover:bg-dark/80 disabled:bg-dark/10 disabled:cursor-not-allowed disabled:text-dark/50 hover:text-white hover:duration-200 grid place-items-center group"
        >
          {loading || purchase_click_loading ? (
            <LoadSmall />
          ) : data.pricing.shouldShowPrice === "Yes" ? (
            !data.availability ? (
              "Artwork Sold"
            ) : (
              "Purchase artwork"
            )
          ) : !data.availability ? (
            "Artwork Sold"
          ) : (
            "Request price"
          )}
        </button>

        {(sessionId === undefined ||
          (sessionId && !likedState.ids.includes(sessionId))) && (
          <button
            onClick={() => handleLike(true)}
            className="w-full h-[50px] px-4 justify-center rounded-md flex items-center gap-2  text-dark hover:bg-dark/10 hover:text-dark ring-1 ring-dark/50 duration-300 group"
          >
            <span>Save artwork</span>
            <IoHeartOutline />
          </button>
        )}
        {sessionId && likedState.ids.includes(sessionId) && (
          <button
            onClick={() => handleLike(false)}
            className="w-full h-[50px] px-4 rounded-md ring-1 flex justify-center items-center gap-2 hover:bg-dark/10 duration-200 ring-dark/50 text-dark text-fluid-xs group"
          >
            <span>Remove from saved</span>
            <GiCheckMark />
          </button>
        )}
      </div>
    </div>
  );
}
