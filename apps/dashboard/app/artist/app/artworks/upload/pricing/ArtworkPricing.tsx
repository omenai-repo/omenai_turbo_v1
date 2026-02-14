"use client";
import { storage } from "@omenai/appwrite-config";
import { uploadArtworkData } from "@omenai/shared-services/artworks/uploadArtworkData";
import uploadImage from "@omenai/shared-services/artworks/uploadArtworkImage";
import { artistArtworkUploadStore } from "@omenai/shared-state-store/src/artist/artwork_upload/artistArtworkUpload";
import { ArtworkMediumTypes } from "@omenai/shared-types";
import { createUploadedArtworkData } from "@omenai/shared-utils/src/createUploadedArtworkData";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import React, { FormEvent, useEffect, useState } from "react";
import { fetchArtworkPriceForArtist } from "@omenai/shared-services/artworks/fetchArtworkPriceForArtist";
import { formatPrice } from "@omenai/shared-utils/src/priceFormatter";
import { TriangleAlert, CheckCircle2, ArrowRight } from "lucide-react";
import ArtworkPricingSkeleton from "@omenai/shared-ui-components/components/skeletons/ArtworkPricingSkeleton";
import Link from "next/link";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { toast_notif } from "@omenai/shared-utils/src/toast_notification";
import { base_url } from "@omenai/url-config/src/config";
import { useRollbar } from "@rollbar/react";
import { LoadSmall } from "@omenai/shared-ui-components/components/loader/Load";

// --- Helper Functions ---
function extractNumberString(str: string) {
  if (!str) return "";
  return str.trim().replaceAll(/[^\d.]/g, "");
}

// --- Main Component ---
export default function ArtworkPricing() {
  const { user, csrf } = useAuth({ requiredRole: "artist" });

  // Destructure store data
  const { image, setImage, artworkUploadData, clearData } =
    artistArtworkUploadStore();

  const [acknowledgment, setAcknowledgment] = useState(false);
  const [penaltyConsent, setPenaltyConsent] = useState(false);
  const [priceConsent, setPriceConsent] = useState(false);
  const [hasUploaded, setHasUploaded] = useState(false);
  const [loading, setLoading] = useState(false);

  const rollbar = useRollbar();
  const router = useRouter();
  const queryClient = useQueryClient();

  const canProceed = acknowledgment && penaltyConsent && priceConsent;

  // Logic for visual progress bar
  const totalSteps = 3;
  const currentStep =
    (priceConsent ? 1 : 0) +
    (acknowledgment ? 1 : 0) +
    (penaltyConsent ? 1 : 0);
  const isComplete = currentStep === totalSteps;

  const artwork_height = extractNumberString(artworkUploadData.height);
  const artwork_width = extractNumberString(artworkUploadData.length);

  const { data: pricing, isLoading } = useQuery({
    queryKey: [
      "fetch_artwork_price",
      artwork_height,
      artwork_width,
      artworkUploadData.medium,
    ],
    queryFn: async () => {
      const response = await fetchArtworkPriceForArtist(
        artworkUploadData.medium as ArtworkMediumTypes,
        user.categorization,
        artwork_height,
        artwork_width,
        user.base_currency as string,
      );

      if (response === undefined || !response.isOk)
        throw new Error("Unable to fetch price data. Please contact support");

      return response.data;
    },
    enabled: !!artwork_height && !!artwork_width && !!artworkUploadData.medium,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5,
  });

  const handleArtworkUpload = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!image) {
      toast_notif("Please select an image to proceed", "error");
      return;
    }

    if (!canProceed) {
      toast_notif(
        "Terms and conditions must be accepted before proceeding",
        "error",
      );
      return;
    }

    try {
      setLoading(true);
      const fileUploaded = await uploadImage(image);
      if (!fileUploaded) throw new Error("Image upload failed");

      const file = {
        bucketId: fileUploaded.bucketId,
        fileId: fileUploaded.$id,
      };

      const packagingType = artworkUploadData.packaging_type || "rolled";

      const data = createUploadedArtworkData(
        {
          ...artworkUploadData,
          price: pricing?.price,
          usd_price: pricing?.usd_price,
          shouldShowPrice: pricing?.shouldShowPrice,
          currency: pricing?.currency,
          packaging_type: packagingType,
        },
        file.fileId,
        user.artist_id ?? "",
        {
          role: "artist",
          designation: user.categorization,
        },
      );

      const uploadResponse = await uploadArtworkData(data, csrf || "");

      if (!uploadResponse?.isOk) {
        try {
          toast_notif(uploadResponse.body.message, "error");
          await storage.deleteFile(
            process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!,
            file.fileId,
          );
        } catch (error) {
          rollbar.error({
            context: "Artist artwork upload: Delete appwrite image",
            error,
          });
        } finally {
          setLoading(false);
        }
        return;
      }

      toast_notif(uploadResponse.body.message, "success");

      await queryClient.invalidateQueries({
        queryKey: ["fetch_artworks_by_id"],
      });

      setHasUploaded(true);
      clearData();
      setImage(null);
      router.replace("/artist/app/artworks");
    } catch (error) {
      if (error instanceof Error) {
        rollbar.error(error);
      } else {
        rollbar.error(new Error(String(error)));
      }
      console.error("Error uploading artwork:", error);
      toast_notif("An error occurred. Please try again later.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Prevent rendering if missing data
  if (!image || !artworkUploadData.medium) {
    return <ArtworkPricingSkeleton />;
  }

  return (
    <form
      onSubmit={handleArtworkUpload}
      className="w-full max-w-4xl mx-auto flex flex-col gap-8 pb-20"
    >
      {isLoading || !pricing || hasUploaded ? (
        <ArtworkPricingSkeleton />
      ) : (
        <>
          {/* --- Section 1: Price Reveal Hero Card --- */}
          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm text-center relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-dark via-slate-600 to-dark" />
            <p className="text-slate-500 text-sm font-medium uppercase tracking-wide mb-3">
              Proposed Listing Price
            </p>
            <div className="flex flex-col items-center justify-center gap-1">
              <h1 className="text-5xl font-bold text-dark tracking-tight">
                {formatPrice(pricing.usd_price, "USD")}
              </h1>
              <p className="text-slate-400 text-sm font-medium mt-2 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                Local currency equivalent:{" "}
                <span className="text-slate-700 font-semibold">
                  {formatPrice(pricing.price, pricing.currency)}
                </span>
              </p>
            </div>
            <div className="mt-6 text-xs text-slate-400 max-w-lg mx-auto leading-relaxed">
              This price is calculated based on your artist tier, the medium,
              and dimensions of the artwork. Consistent pricing helps build
              collector trust.
            </div>
          </div>

          {/* --- Section 2: Agreements --- */}
          <div className="bg-amber-50/50 border border-amber-200 rounded-xl overflow-hidden shadow-sm">
            {/* Header */}
            <div className="bg-amber-100/60 px-6 py-4 border-b border-amber-200 flex items-center gap-3">
              <div className="p-2 bg-amber-200 text-amber-700 rounded-lg shrink-0">
                <TriangleAlert size={20} strokeWidth={2} />
              </div>
              <div>
                <h3 className="text-amber-900 font-semibold text-sm sm:text-base">
                  Exclusivity & Pricing Agreement
                </h3>
                <p className="text-amber-800/70 text-xs mt-0.5">
                  Please review and accept terms to proceed.
                </p>
              </div>
            </div>

            {/* Checklist */}
            <div className="p-5 sm:p-6 space-y-3">
              <CheckboxCard
                checked={priceConsent}
                onChange={setPriceConsent}
                text="I accept the price stipulated for this artwork and agree to have it listed on the platform at this price. I understand that I may cancel this upload if I do not agree."
              />

              <CheckboxCard
                checked={acknowledgment}
                onChange={setAcknowledgment}
                text={
                  <span>
                    I acknowledge that this artwork is subject to a 90-day
                    exclusivity period with Omenai as stipulated in the{" "}
                    <Link
                      href={`${base_url()}/legal?ent=artist`}
                      target="__blank"
                      className="text-amber-700 underline decoration-amber-400 underline-offset-2 hover:text-amber-900 font-medium transition-colors"
                    >
                      Terms of Agreement
                    </Link>{" "}
                    and may not be sold through external channels during this
                    time.
                  </span>
                }
              />

              <CheckboxCard
                checked={penaltyConsent}
                onChange={setPenaltyConsent}
                text={
                  <span>
                    I agree that any breach of this exclusivity obligation will
                    result in a 10% penalty fee deducted from my next successful
                    sale on the platform as stipulated in the{" "}
                    <Link
                      href={`${base_url()}/legal?ent=artist`}
                      target="__blank"
                      className="text-amber-700 underline decoration-amber-400 underline-offset-2 hover:text-amber-900 font-medium transition-colors"
                    >
                      Terms of Agreement.
                    </Link>
                  </span>
                }
              />
            </div>

            {/* Progress Footer */}
            <div className="px-6 py-3 bg-white border-t border-amber-100 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                <span className="hidden sm:inline">Completion Status:</span>
                <div className="flex gap-1">
                  {[1, 2, 3].map((step) => (
                    <div
                      key={step}
                      className={`h-1.5 w-6 rounded-full transition-all duration-300 ${
                        step <= currentStep ? "bg-green-500" : "bg-slate-200"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <div
                className={`text-xs font-semibold px-3 py-1 rounded-full transition-colors duration-300 ${
                  isComplete
                    ? "bg-green-100 text-green-700"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {isComplete
                  ? "All Agreed"
                  : `${currentStep}/${totalSteps} Agreed`}
              </div>
            </div>
          </div>

          {/* --- Section 3: Action Buttons --- */}
          <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4 mt-2">
            <Link
              href={"/artist/app/artworks/upload"}
              className="w-full sm:w-auto"
            >
              <button
                type="button"
                className="w-full sm:w-auto px-8 py-3.5 rounded-lg border border-slate-300 text-slate-600 font-medium text-sm hover:bg-slate-50 hover:text-dark transition-colors"
              >
                Cancel Upload
              </button>
            </Link>

            <button
              type="submit"
              disabled={loading || !canProceed}
              className={`w-full sm:w-auto flex items-center justify-center gap-2 px-10 py-3.5 rounded-lg font-medium text-sm text-white shadow-lg transition-all duration-200
                ${
                  loading || !canProceed
                    ? "bg-slate-300 cursor-not-allowed shadow-none"
                    : "bg-dark hover:bg-black hover:-translate-y-0.5"
                }
              `}
            >
              {loading ? (
                <LoadSmall />
              ) : (
                <>
                  Publish Artwork <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </>
      )}
    </form>
  );
}

// --- Sub-Component: Checkbox Card ---
function CheckboxCard({
  checked,
  onChange,
  text,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  text: React.ReactNode;
}) {
  return (
    <label
      className={`relative flex items-start gap-4 p-4 rounded-lg border transition-all duration-200 cursor-pointer group select-none
      ${
        checked
          ? "bg-white border-amber-300 shadow-sm ring-1 ring-amber-100"
          : "bg-white/50 border-transparent hover:bg-white hover:border-amber-200"
      }`}
    >
      <div className="pt-0.5 shrink-0">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="peer sr-only"
        />
        <div
          className={`h-5 w-5 rounded border flex items-center justify-center transition-all duration-200 
          ${
            checked
              ? "bg-amber-500 border-amber-600 text-white"
              : "bg-white border-slate-300 text-transparent group-hover:border-amber-400"
          }`}
        >
          <CheckCircle2
            size={14}
            strokeWidth={3}
            className={`transition-transform duration-200 ${
              checked ? "scale-100" : "scale-0"
            }`}
          />
        </div>
      </div>
      <span
        className={`text-sm leading-relaxed transition-colors ${
          checked ? "text-slate-800" : "text-slate-600"
        }`}
      >
        {text}
      </span>
    </label>
  );
}
