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
import ArtworkPricingSkeleton from "@omenai/shared-ui-components/components/skeletons/ArtworkPricingSkeleton";
import Link from "next/link";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { toast_notif } from "@omenai/shared-utils/src/toast_notification";
import { useRollbar } from "@rollbar/react";
import { LoadSmall } from "@omenai/shared-ui-components/components/loader/Load";
import { BUTTON_CLASS } from "@omenai/shared-ui-components/components/styles/inputClasses";
import PriceRevealCard from "./components/PriceRevealCard";
import AgreementsSection from "./components/AgreementSection";
import PriceDisputeTrigger from "./components/PriceDisputeTrigger";
import PriceVisibilitySelect from "./components/PriceVisibilitySelect";

function extractNumberString(str: string) {
  if (!str) return "";
  return str.trim().replaceAll(/[^\d.]/g, "");
}

export default function ArtworkPricing() {
  const { user, csrf } = useAuth({ requiredRole: "artist" });
  const { image, setImage, artworkUploadData, clearData } =
    artistArtworkUploadStore();
  const rollbar = useRollbar();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [acknowledgment, setAcknowledgment] = useState(false);
  const [penaltyConsent, setPenaltyConsent] = useState(false);
  const [priceConsent, setPriceConsent] = useState(false);
  const [hasUploaded, setHasUploaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shouldShowPrice, setShouldShowPrice] = useState<"Yes" | "No">("Yes");
  const [isVisibilityDropdownOpen, setIsVisibilityDropdownOpen] =
    useState(false);

  const canProceed = acknowledgment && penaltyConsent && priceConsent;
  const currentStep =
    (priceConsent ? 1 : 0) +
    (acknowledgment ? 1 : 0) +
    (penaltyConsent ? 1 : 0);

  const artwork_height = extractNumberString(artworkUploadData.height);
  const artwork_width = extractNumberString(artworkUploadData.width);

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

  const handleArtworkUpload = async (e: React.FormEvent | React.MouseEvent) => {
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

      const packagingType = artworkUploadData.packaging_type ?? "rolled";

      const data = createUploadedArtworkData(
        {
          ...artworkUploadData,
          price: pricing?.price,
          usd_price: pricing?.usd_price,
          shouldShowPrice,
          currency: pricing?.currency,
          packaging_type: packagingType,
        },
        file.fileId,
        user.artist_id,
        {
          role: "artist",
          designation: user.categorization,
        },
      );

      const uploadResponse = await uploadArtworkData(data, csrf || "");

      if (!uploadResponse?.isOk) {
        try {
          toast_notif(uploadResponse.body.message, "error");
          await storage.deleteFile({
            bucketId: process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!,
            fileId: file.fileId,
          });
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
      setImage(null);
      clearData();

      toast_notif(uploadResponse.body.message, "success");

      await queryClient.invalidateQueries({
        queryKey: ["fetch_artworks_by_id"],
      });

      setHasUploaded(true);
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

  if (!image || !artworkUploadData.medium) return <ArtworkPricingSkeleton />;

  const priceReviewArtworkData = { ...artworkUploadData, shouldShowPrice };

  return (
    <div
      onSubmit={handleArtworkUpload}
      className="w-full h-full max-w-[90rem] mx-auto  flex flex-col gap-8 pb-20"
    >
      {isLoading || !pricing || hasUploaded ? (
        <ArtworkPricingSkeleton />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: The Workspace (65%) */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-6">
            <div className="bg-white border border-neutral-200 rounded -lg overflow-hidden flex flex-col">
              <PriceRevealCard
                usd_price={pricing.usd_price}
                price={pricing.price}
                currency={pricing.currency}
              />
              <PriceDisputeTrigger
                pricingData={pricing.algorithm_recommendation}
                artworkMeta={priceReviewArtworkData}
                image={image}
              />
            </div>

            {user.categorization !== "Emerging" && (
              <PriceVisibilitySelect
                shouldShowPrice={shouldShowPrice}
                setShouldShowPrice={setShouldShowPrice}
                isOpen={isVisibilityDropdownOpen}
                setIsOpen={setIsVisibilityDropdownOpen}
              />
            )}
          </div>

          {/* Right Column: Commitment Panel (35%) */}
          <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-6 sticky top-24">
            <AgreementsSection
              priceConsent={priceConsent}
              setPriceConsent={setPriceConsent}
              acknowledgment={acknowledgment}
              setAcknowledgment={setAcknowledgment}
              penaltyConsent={penaltyConsent}
              setPenaltyConsent={setPenaltyConsent}
              currentStep={currentStep}
              totalSteps={3}
              isComplete={currentStep === 3}
            />

            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={handleArtworkUpload}
                disabled={loading || !canProceed}
                className={`${BUTTON_CLASS} w-full py-4 text-base tracking-wide shadow-xl ${
                  loading || !canProceed
                    ? "bg-neutral-300 text-neutral-500 cursor-not-allowed shadow-none"
                    : "bg-dark text-white hover:bg-black hover:-translate-y-0.5"
                }`}
              >
                {loading ? <LoadSmall /> : "Publish Artwork"}
              </button>

              <Link href={"/artist/app/artworks/upload"} className="w-full">
                <button
                  type="button"
                  className="w-full px-8 py-3.5 rounded -lg text-neutral-500 font-medium text-sm hover:bg-neutral-100 transition-colors"
                >
                  Cancel & Discard
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
