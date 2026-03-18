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
import { ID } from "appwrite";
import ExclusivityAgreement from "../ExclusivityAgreement";

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
  hasAutoApprovalsRemaining: boolean;
  onCancel?: () => void;
  onSuccess?: () => void;
}

const uploadDocument = async (file: File) => {
  if (!file) return;
  const fileUploaded = await storage.createFile({
    bucketId: process.env.NEXT_PUBLIC_APPWRITE_DOCUMENTATION_BUCKET_ID!,
    fileId: ID.unique(),
    file,
  });
  return fileUploaded;
};

export default function PriceReviewWidget({
  pricingData,
  artworkMeta,
  image,
  hasAutoApprovalsRemaining,
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
  const [justificationFile, setJustificationFile] = useState<File | null>(null);
  const [justificationUrl, setJustificationUrl] = useState("");
  const [justificationNotes, setJustificationNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isVisibilityDropdownOpen, setIsVisibilityDropdownOpen] =
    useState(false);
  const [shouldShowPrice, setShouldShowPrice] = useState<"Yes" | "No">("Yes");

  const [priceConsent, setPriceConsent] = useState(false);
  const [acknowledgment, setAcknowledgment] = useState(false);
  const [penaltyConsent, setPenaltyConsent] = useState(false);
  const allTermsAccepted = priceConsent && acknowledgment && penaltyConsent;

  const appwriteEndpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_CLIENT_ID;

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

  // Inside PriceReviewWidget.tsx
  const isAutoApproveZone = useMemo(() => {
    if (requestedPrice === "") return true;
    return requestedPrice <= maxAllowedPrice && hasAutoApprovalsRemaining;
  }, [requestedPrice, maxAllowedPrice, hasAutoApprovalsRemaining]);

  const handleSubmit = async () => {
    if (!requestedPrice || requestedPrice <= 0) {
      return toast_notif("Please enter a valid price", "error");
    }

    if (!allTermsAccepted) {
      return toast_notif(
        "Please accept the exclusivity agreement to proceed",
        "error",
      );
    }

    if (!isAutoApproveZone) {
      if (!justificationType) {
        return toast_notif("Please select a justification type", "error");
      }

      if (
        (justificationType === "PAST_SALE" ||
          justificationType === "GALLERY_EXHIBITION") &&
        !justificationUrl &&
        !justificationFile
      ) {
        return toast_notif("Proof via Link or Document is required", "error");
      }

      // NEW: Explicitly require notes and prevent whitespace-only submissions
      if (!justificationNotes || justificationNotes.trim() === "") {
        return toast_notif(
          "Please provide some context to justify the price change",
          "error",
        );
      }
    }

    setIsSubmitting(true);

    const fileUploaded = await uploadImage(image);
    if (!fileUploaded) {
      setIsSubmitting(false);
      throw new Error("Image upload failed");
    }

    const file = {
      bucketId: fileUploaded.bucketId,
      fileId: fileUploaded.$id,
    };

    let finalJustificationUrl = justificationUrl;
    if (justificationFile) {
      const docUploaded = await uploadDocument(justificationFile);
      if (!docUploaded) {
        setIsSubmitting(false);
        throw new Error("Document upload failed");
      }
      const fileId = docUploaded.$id;
      const bucketId = docUploaded.bucketId;

      finalJustificationUrl = `${appwriteEndpoint}/storage/buckets/${bucketId}/files/${fileId}/view?project=${projectId}`;
    }

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
          justification_proof_url: finalJustificationUrl,
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
      isAutoApproveZone
        ? router.replace("/artist/app/artworks")
        : router.replace("/artist/app/reviews");
    } catch (error: any) {
      toast_notif(error.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-6xl bg-white rounded-lg shadow-2xl flex flex-col md:flex-row relative overflow-hidden max-h-[90vh]">
      <button
        onClick={onCancel}
        className="absolute top-4 right-4 p-5 bg-neutral-100/80 backdrop-blur hover:bg-neutral-200 text-neutral-600 rounded-full transition-colors z-20"
      >
        <X size={20} />
      </button>

      {/* Left Panel */}
      <div className="hidden md:flex flex-col w-2/5 bg-dark text-white p-8 lg:p-16 justify-between overflow-y-auto">
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
              <div className="p-2 bg-neutral-800 rounded-lg text-amber-400">
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
              <div className="p-2 bg-neutral-800 rounded-lg text-blue-400">
                <TrendingUp size={18} />
              </div>
              <div>
                <h4 className="font-medium text-sm">Data-Backed Adjustments</h4>
                <p className="text-xs text-neutral-400 mt-1">
                  Significant price changes require verification via past
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

      {/* Right Panel */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full md:w-3/5 flex flex-col bg-neutral-50 h-full max-h-[85vh] md:max-h-none"
      >
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 lg:p-10">
          <div className="mb-8 pr-8">
            <h3 className="text-xl font-bold text-dark">Propose New Price</h3>
            <p className="text-sm text-neutral-500 mt-1">
              Adjust the baseline pricing and visibility for this specific
              artwork.
            </p>
          </div>

          <div className="flex flex-col gap-6 py-6">
            <PriceInputSection
              recommendedPrice={pricingData.recommendedPrice}
              requestedPrice={requestedPrice}
              setRequestedPrice={setRequestedPrice}
              maxAllowedPrice={maxAllowedPrice}
              hasAutoApprovalsRemaining={hasAutoApprovalsRemaining}
            />

            {user.categorization !== "Emerging" && (
              <PriceVisibilitySelect
                shouldShowPrice={shouldShowPrice}
                setShouldShowPrice={setShouldShowPrice}
                isOpen={isVisibilityDropdownOpen}
                setIsOpen={setIsVisibilityDropdownOpen}
              />
            )}

            <AnimatePresence>
              {!isAutoApproveZone && (
                <JustificationSection
                  justificationType={justificationType as JustificationType}
                  setJustificationType={setJustificationType}
                  justificationUrl={justificationUrl}
                  setJustificationUrl={setJustificationUrl}
                  justificationFile={justificationFile}
                  setJustificationFile={setJustificationFile}
                  justificationNotes={justificationNotes}
                  setJustificationNotes={setJustificationNotes}
                />
              )}
            </AnimatePresence>

            <div className="pt-4 border-t border-neutral-200 mt-2">
              <ExclusivityAgreement
                priceConsent={priceConsent}
                setPriceConsent={setPriceConsent}
                acknowledgment={acknowledgment}
                setAcknowledgment={setAcknowledgment}
                penaltyConsent={penaltyConsent}
                setPenaltyConsent={setPenaltyConsent}
              />
            </div>
          </div>
        </div>

        <div className="shrink-0 p-5 sm:px-8 border-t border-neutral-200 bg-white flex gap-3 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-6 py-3 w-full md:w-auto text-sm font-medium text-neutral-600 bg-white border border-neutral-300 hover:bg-neutral-50 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={
              isSubmitting || requestedPrice === "" || !allTermsAccepted
            }
            className={`flex-1 flex justify-center items-center gap-2 px-6 py-3 text-sm font-medium text-white rounded-lg transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed ${
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
