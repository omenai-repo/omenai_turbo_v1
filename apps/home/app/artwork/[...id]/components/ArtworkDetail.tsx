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
import { useContext, useState } from "react";
import { PiFrameCornersThin } from "react-icons/pi";
import {
  SessionContext,
  useSession,
} from "@omenai/package-provider/SessionProvider";
import {
  ArtworkResultTypes,
  IndividualSchemaTypes,
} from "@omenai/shared-types";
import { LoadSmall } from "@omenai/shared-ui-components/components/loader/Load";
import FullArtworkDetails from "./FullArtworkDetails";

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

  const { toggleLoginModal } = actionStore();

  const router = useRouter();
  const { session } = useContext(SessionContext);

  async function handleBuyButtonClick() {
    if (sessionId === undefined) toggleLoginModal(true);
    else {
      if (data.pricing.shouldShowPrice === "Yes") {
        router.push(`/purchase/${data.title}`);
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
          (session as IndividualSchemaTypes).email,
          (session as IndividualSchemaTypes).name
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
          toast.error("Error notification", {
            description:
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
      <div className="text-dark/80">
        <h1 className="text-sm sm:text-md font-[900]">{data.title}</h1>
        <h3 className="text-base font-normal italic text-dark/70">
          {data.artist}
        </h3>
      </div>
      <p className="text-[14px] font-medium text-dark/80 gap-x-4 flex items-center">
        <span>{data.medium}</span>
        <span>|</span>
        <span>{data.rarity}</span>
      </p>

      <Dimensions dimensions={data.dimensions} />
      <div className="flex items-center flex-wrap gap-4">
        {data.certificate_of_authenticity === "Yes" && (
          <div className="flex gap-x-2 text-[14px] items-center px-4 py-1 bg-[#E7F6EC] text-[#004617] w-fit rounded-full">
            <GrCertificate />
            <p className="whitespace-nowrap">
              Certificate of authenticity available
            </p>
          </div>
        )}
        <div className="flex gap-x-2 text-[14px] items-center px-4 py-1 bg-[#e5f4ff] text-[#30589f] w-fit rounded-full">
          <PiFrameCornersThin />
          <p className="whitespace-nowrap">
            {data.framing === "Framed"
              ? "Frame Included"
              : "Artwork is not framed"}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-y-2 my-4">
        {/* <span className="text-[14px] font-medium">Price</span> */}
        <h1 className=" text-sm font-[900]">
          {!data.availability
            ? "Sold"
            : data.pricing.shouldShowPrice === "Yes"
              ? formatPrice(data.pricing.usd_price)
              : "Price on request"}
        </h1>
      </div>

      <div className="flex flex-col gap-y-3 font-normal w-full text-[14px]">
        <button
          disabled={loading || !data.availability}
          onClick={handleBuyButtonClick}
          className="w-full bg-dark h-[50px] px-4 rounded-full text-white hover:bg-dark/80 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:text-dark/50 hover:text-white hover:duration-200 grid place-items-center group"
        >
          {loading ? (
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
            className="w-full h-[50px] px-4 justify-center rounded-full flex items-center gap-2  text-dark hover:bg-dark/10 hover:text-dark ring-1 ring-dark/50 duration-300 group"
          >
            <span>Save artwork</span>
            <IoHeartOutline />
          </button>
        )}
        {sessionId !== undefined && likedState.ids.includes(sessionId) && (
          <button
            onClick={() => handleLike(false)}
            className="w-full h-[50px] px-4 rounded-full ring-1 flex justify-center items-center gap-2 hover:bg-dark/10 duration-200 ring-dark/50 text-dark text-[14px] group"
          >
            <span>Remove from saved</span>
            <GiCheckMark />
          </button>
        )}
      </div>
    </div>
  );
}
