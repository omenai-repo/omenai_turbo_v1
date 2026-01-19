"use client";
import { storage } from "@omenai/appwrite-config";
import { uploadArtworkData } from "@omenai/shared-services/artworks/uploadArtworkData";
import uploadImage from "@omenai/shared-services/artworks/uploadArtworkImage";
import { artistArtworkUploadStore } from "@omenai/shared-state-store/src/artist/artwork_upload/artistArtworkUpload";
import { ArtworkMediumTypes } from "@omenai/shared-types";
import { createUploadedArtworkData } from "@omenai/shared-utils/src/createUploadedArtworkData";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import React, { FormEvent, useState } from "react";
import { fetchArtworkPriceForArtist } from "@omenai/shared-services/artworks/fetchArtworkPriceForArtist";
import { Alert, Paper } from "@mantine/core";
import { LoadSmall } from "@omenai/shared-ui-components/components/loader/Load";
import { formatPrice } from "@omenai/shared-utils/src/priceFormatter";
import { TriangleAlert } from "lucide-react";
import ArtworkPricingSkeleton from "@omenai/shared-ui-components/components/skeletons/ArtworkPricingSkeleton";
import Link from "next/link";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { toast_notif } from "@omenai/shared-utils/src/toast_notification";
import { base_url } from "@omenai/url-config/src/config";
import { useRollbar } from "@rollbar/react";
function extractNumberString(str: string) {
  if (!str) return ""; // handle empty or null input

  const cleaned = str.trim().replaceAll(/[^\d.]/g, ""); // keep only digits and dot

  return cleaned;
}
export default function ArtworkPricing() {
  const { user, csrf } = useAuth({ requiredRole: "artist" });
  const { image, setImage, artworkUploadData, clearData } =
    artistArtworkUploadStore();
  const [acknowledgment, setAcknowledgment] = useState(false);
  const [penaltyConsent, setPenaltyConsent] = useState(false);
  const [priceConsent, setPriceConsent] = useState(false);
  const [hasUploaded, setHasUploaded] = useState(false);

  const rollbar = useRollbar();

  const canProceed = acknowledgment && penaltyConsent && priceConsent;

  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();
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
        user.base_currency as string
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
        "error"
      );
      return;
    }

    try {
      setLoading(true);

      // 1 ─ Upload image
      console.log(image);
      const fileUploaded = await uploadImage(image);
      if (!fileUploaded) throw new Error("Image upload failed");

      const file = {
        bucketId: fileUploaded.bucketId,
        fileId: fileUploaded.$id,
      };

      // 2 ─ Build payload
      const data = createUploadedArtworkData(
        {
          ...artworkUploadData,
          price: pricing?.price,
          usd_price: pricing?.usd_price,
          shouldShowPrice: pricing?.shouldShowPrice,
          currency: pricing?.currency,
        },
        file.fileId,
        user.artist_id ?? "",
        {
          role: "artist",
          designation: user.categorization,
        }
      );

      // 3 ─ Upload metadata
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
          setImage(null);
        }
        return;
      }

      // 4 ─ Success toast
      toast_notif(uploadResponse.body.message, "success");

      // 5 ─ Invalidate listings
      await queryClient.invalidateQueries({
        queryKey: ["fetch_artworks_by_id"],
      });

      setHasUploaded(true);

      // 6 ─ Redirect IMMEDIATELY so component unmounts
      router.replace("/artist/app/artworks");

      // 7 ─ Clear store AFTER redirect so current page never rerenders
      setTimeout(() => {
        clearData();
        setImage(null);
      }, 1000); // microtask / async tick
    } catch (error) {
      if (error instanceof Error) {
        rollbar.error(error);
      } else {
        rollbar.error(new Error(String(error)));
      }

      console.error("Error uploading artwork:", error);
      toast_notif(
        "An error occurred while uploading the artwork. Please try again later.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleArtworkUpload}
      className="bg-[#f8f8f8] p-10 rounded flex flex-col max-w-5xl"
    >
      {isLoading || !pricing || hasUploaded ? (
        <ArtworkPricingSkeleton />
      ) : (
        <>
          <h1 className="font-bold text-fluid-base">Proposed Artwork Price</h1>
          <Paper
            radius="sm"
            className="flex flex-col space-y-2 p-5 my-6"
            withBorder
          >
            <p className="text-fluid-xxs">
              Omenai will list your art piece for
            </p>
            <h1 className="text-fluid-md font-bold">
              {formatPrice(pricing.usd_price, "USD")}
            </h1>
            <p className="text-fluid-xxs font-medium">
              ({pricing.currency} equivalent:{" "}
              <span className="font-bold text-fluid-xxs">
                {formatPrice(pricing.price, pricing.currency)})
              </span>
            </p>
          </Paper>

          <div className="my-4">
            <Alert
              variant="light"
              color="yellow"
              radius="sm"
              title="Exclusivity Agreement"
              icon={<TriangleAlert strokeWidth={1.5} />}
              className="font-medium"
            >
              <div className="mt-3 space-y-2 px-4">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={priceConsent}
                    onChange={(e) => setPriceConsent(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-yellow-500 cursor-pointer"
                  />
                  <span className="text-fluid-xxs text-dark font-normal group-hover:text-gray-900">
                    I accept the price stipulated for this artwork and agree to
                    have it listed on the platform at this price. I understand
                    that I may cancel this upload if I do not agree.
                  </span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={acknowledgment}
                    onChange={(e) => setAcknowledgment(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-yellow-500 cursor-pointer"
                  />
                  <span className="text-fluid-xxs text-dark font-normal group-hover:text-gray-900">
                    I acknowledge that this artwork is subject to a 90-day
                    exclusivity period with Omenai as stipulated in the{" "}
                    <Link
                      href={`${base_url()}/legal?ent=artist`}
                      target="__blank"
                      className="underline font-semibold text-dark"
                    >
                      Terms of Agreement
                    </Link>{" "}
                    and may not be sold through external channels during this
                    time.
                  </span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={penaltyConsent}
                    onChange={(e) => setPenaltyConsent(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-yellow-500 cursor-pointer"
                  />
                  <span className="text-fluid-xxs text-dark font-normal group-hover:text-gray-900">
                    I agree that any breach of this exclusivity obligation will
                    result in a 10% penalty fee deducted from my next successful
                    sale on the platform as stipulated in the{" "}
                    <Link
                      href={`${base_url()}/legal?ent=artist`}
                      target="__blank"
                      className="underline font-semibold text-dark"
                    >
                      Terms of Agreement.
                    </Link>{" "}
                  </span>
                </label>
              </div>
            </Alert>
          </div>

          <div className="mt-4 text-fluid-xxs text-slate-700">
            Acknowledgment: {acknowledgment ? "✔️" : "❌"} | Penalty Consent:{" "}
            {penaltyConsent ? "✔️" : "❌"} | Price Consent:{" "}
            {priceConsent ? "✔️" : "❌"}
          </div>

          <div className="w-full flex justify-between items-center gap-x-4 mb-2 mt-6">
            <Link href={"/artist/app/artworks/upload"} className="w-fit h-fit">
              <button className="h-[35px] p-5 rounded w-full flex items-center justify-center gap-3 disabled:cursor-not-allowed disabled:bg-dark/10 disabled:text-[#A1A1A1] bg-white hover:bg-[#f1f1f1] text-dark ring-1 ring-dark text-fluid-xxs font-normal whitespace-nowrap">
                Cancel
              </button>
            </Link>

            <button
              type="submit"
              disabled={loading || !canProceed}
              className="h-[35px] p-5 rounded w-full flex items-center justify-center gap-3 disabled:cursor-not-allowed disabled:bg-dark/10 disabled:text-[#A1A1A1] bg-dark text-white text-fluid-xxs hover:bg-dark/90 font-normal whitespace-nowrap"
            >
              {loading ? <LoadSmall /> : "Upload artwork"}
            </button>
          </div>
        </>
      )}
    </form>
  );
}
