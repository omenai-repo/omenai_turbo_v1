"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, X, Info, TrendingUp, ShieldCheck } from "lucide-react";
import { toast_notif } from "@omenai/shared-utils/src/toast_notification";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { createPriceReviewRequest } from "@omenai/shared-services/artworks/createPriceReviewRequest";
import {
  JustificationType,
  ArtworkUploadStateTypes,
} from "@omenai/shared-types";
import JustificationSection from "./JustificationSelection";
import PriceInputSection from "./PriceInputSelection";
import uploadImage from "@omenai/shared-services/artworks/uploadArtworkImage";
import { createUploadedArtworkData } from "@omenai/shared-utils/src/createUploadedArtworkData";
import PriceVisibilitySelect from "./PriceVisibilitySelect";
import { storage } from "@omenai/appwrite-config";
import { useRollbar } from "@rollbar/react";

type PricingData = {
  recommendedPrice: number;
  priceRange: [number, number, number, number, number];
  meanPrice: number;
};

interface PriceReviewWidgetProps {
  pricingData: PricingData;
  artworkMeta: Omit<
    ArtworkUploadStateTypes,
    | "art_id"
    | "availability"
    | "exclusivity_status"
    | "price"
    | "usd_price"
    | "shouldShowPrice"
    | "currency"
  >;
  image: File;
  onCancel?: () => void;
  onSuccess?: () => void;
}

export default function PriceReviewWidget({
  pricingData,
  artworkMeta,
  image,
  onCancel,
  onSuccess,
}: PriceReviewWidgetProps) {
  const router = useRouter();
  const { user, csrf } = useAuth({ requiredRole: "artist" });
  const artistCategory = user?.categorization || "Emerging";
  const artistId = user.artist_id;
  const rollbar = useRollbar();
  const [requestedPrice, setRequestedPrice] = useState<number | "">("");
  const [justificationType, setJustificationType] = useState<
    JustificationType | ""
  >("");
  const [justificationUrl, setJustificationUrl] = useState("");
  const [justificationNotes, setJustificationNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isVisibilityDropdownOpen, setIsVisibilityDropdownOpen] =
    useState(false);
  const [shouldShowPrice, setShouldShowPrice] = useState<"Yes" | "No">("Yes");

  const maxAllowedPrice = useMemo(() => {
    const categoryVariances: Record<string, number> = {
      Emerging: 0.1,
      "Early Mid-Career": 0.2,
      "Mid-Career": 0.25,
      "Late Mid-Career": 0.35,
      Established: 0.35,
      Elite: 0.35,
    };
    const varianceLimit = categoryVariances[artistCategory] || 0.1;
    const anchorPrice = pricingData.priceRange[3];
    return anchorPrice * (1 + varianceLimit);
  }, [artistCategory, pricingData.priceRange]);

  const isAutoApproveZone = useMemo(() => {
    if (requestedPrice === "") return true;
    return requestedPrice <= maxAllowedPrice;
  }, [requestedPrice, maxAllowedPrice]);

  const handleSubmit = async () => {
    if (!requestedPrice || requestedPrice <= 0) {
      return toast_notif("Please enter a valid price", "error");
    }
    if (!isAutoApproveZone) {
      if (!justificationType)
        return toast_notif("Please select a reason", "error");
      if (
        (justificationType === "PAST_SALE" ||
          justificationType === "GALLERY_EXHIBITION") &&
        !justificationUrl
      ) {
        return toast_notif("A proof URL is required", "error");
      }
    }

    setIsSubmitting(true);

    const fileUploaded = await uploadImage(image);
    if (!fileUploaded) throw new Error("Image upload failed");

    const file = {
      bucketId: fileUploaded.bucketId,
      fileId: fileUploaded.$id,
    };

    const packagingType = artworkMeta.packaging_type ?? "rolled";

    const artwork = createUploadedArtworkData(
      {
        ...artworkMeta,
        price: requestedPrice,
        usd_price: requestedPrice,
        shouldShowPrice,
        currency: "USD",
        packaging_type: packagingType,
      },
      file.fileId,
      user.artist_id,
      {
        role: "artist",
        designation: user.categorization,
      },
    );

    const payload = {
      artist_id: artistId,
      artist_review: {
        requested_price: requestedPrice,
        ...(!isAutoApproveZone && {
          justification_type: justificationType,
          justification_proof_url: justificationUrl,
          justification_notes: justificationNotes,
        }),
      },
      meta: {
        artwork,
        algorithm_recommendation: pricingData,
      },
    };

    try {
      const response = await createPriceReviewRequest(payload, csrf || "");

      if (!response.isOk) {
        try {
          toast_notif(response.message, "error");
          await storage.deleteFile({
            bucketId: process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!,
            fileId: file.fileId,
          });
        } catch (error) {
          rollbar.error({
            context: "Artist artwork upload: Delete appwrite image",
            error,
          });
        }
        return;
      }

      if (response.status === "AUTO_APPROVED") {
        toast_notif(
          "Price approved! Your artwork is being published.",
          "success",
        );
      } else {
        toast_notif("Review submitted. We'll notify you shortly.", "success");
      }

      if (onSuccess) onSuccess();
      router.replace("/artist/app/reviews");
    } catch (error: any) {
      toast_notif(error.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    // 1. Constrained Height on Outer Wrapper (max-h-[85vh])
    <div className="w-full max-w-6xl bg-white rounded -lg shadow-2xl flex flex-col md:flex-row relative overflow-hidden max-h-[90vh]">
      {/* Close Button - Given a solid background to hover nicely over scrolling content */}
      <button
        onClick={onCancel}
        className="absolute top-4 right-4 p-5 bg-neutral-100/80 backdrop-blur-sm hover:bg-neutral-200 text-neutral-600 rounded -full transition-colors z-20"
      >
        <X size={20} />
      </button>

      {/* Left Panel: Context & Guidelines (Scrollable just in case on small heights) */}
      <div className="hidden md:flex flex-col w-2/5 bg-dark text-white p-8 lg:p-10 justify-between overflow-y-auto">
        <div>
          <h2 className="text-2xl font-semibold mb-6">Pricing Override</h2>
          <p className="text-neutral-400 text-sm leading-relaxed mb-8">
            Our algorithm recommends{" "}
            <span className="text-white font-medium">
              ${pricingData.recommendedPrice.toLocaleString()}
            </span>{" "}
            to maximize your sell-through rate based on current market trends.
            However, we understand that real-world factors can influence value.
          </p>

          <div className="space-y-6">
            <div className="flex gap-4 items-start">
              <div className="p-2 bg-neutral-800 rounded -lg text-amber-400">
                <ShieldCheck size={18} />
              </div>
              <div>
                <h4 className="font-medium text-sm">Automated Approvals</h4>
                <p className="text-xs text-neutral-400 mt-1">
                  Minor adjustments within your tier's threshold are instantly
                  approved.
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="p-2 bg-neutral-800 rounded -lg text-blue-400">
                <TrendingUp size={18} />
              </div>
              <div>
                <h4 className="font-medium text-sm">Data-Backed Adjustments</h4>
                <p className="text-xs text-neutral-400 mt-1">
                  Significant price increases require verification via past
                  gallery sales or exhibitions.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 mt-8 border-t border-neutral-800 flex items-center gap-3 text-xs text-neutral-500">
          <Info size={14} className="shrink-0" />
          <span>
            Overrides are reviewed by our Advisory team within 24 hours.
          </span>
        </div>
      </div>

      {/* Right Panel: The Interactive Form as a Flex Container */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full md:w-3/5 flex flex-col bg-neutral-50 h-full max-h-[85vh] md:max-h-none"
      >
        {/* 2. Scrollable Body Area (flex-1 and overflow-y-auto) */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 lg:p-10">
          <div className="mb-8 pr-8">
            {" "}
            {/* pr-8 prevents text overlapping the close button */}
            <h3 className="text-xl font-bold text-dark">Propose New Price</h3>
            <p className="text-sm text-neutral-500 mt-1">
              Adjust the baseline pricing and visibility for this specific
              artwork.
            </p>
          </div>

          <div className="flex flex-col gap-6">
            <PriceInputSection
              recommendedPrice={pricingData.recommendedPrice}
              requestedPrice={requestedPrice}
              setRequestedPrice={setRequestedPrice}
              isAutoApproveZone={isAutoApproveZone}
            />

            <PriceVisibilitySelect
              shouldShowPrice={shouldShowPrice}
              setShouldShowPrice={setShouldShowPrice}
              isOpen={isVisibilityDropdownOpen}
              setIsOpen={setIsVisibilityDropdownOpen}
            />

            <AnimatePresence>
              {!isAutoApproveZone && (
                <JustificationSection
                  justificationType={justificationType as JustificationType}
                  setJustificationType={setJustificationType}
                  justificationUrl={justificationUrl}
                  setJustificationUrl={setJustificationUrl}
                  justificationNotes={justificationNotes}
                  setJustificationNotes={setJustificationNotes}
                />
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* 3. Sticky Footer Area (shrink-0 ensures it never gets squeezed) */}
        <div className="shrink-0 p-5 sm:px-8 border-t border-neutral-200 bg-white flex gap-3 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-6 py-3 w-full md:w-auto text-sm font-medium text-neutral-600 bg-white border border-neutral-300 hover:bg-neutral-50 rounded -lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || requestedPrice === ""}
            className={`flex-1 flex justify-center items-center gap-2 px-6 py-3 text-sm font-medium text-white rounded -lg transition-all shadow-md disabled:opacity-50 ${
              isAutoApproveZone
                ? "bg-dark hover:bg-black"
                : "bg-amber-600 hover:bg-amber-700"
            }`}
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {isAutoApproveZone
              ? "Submit & Continue"
              : "Submit for Verification"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
