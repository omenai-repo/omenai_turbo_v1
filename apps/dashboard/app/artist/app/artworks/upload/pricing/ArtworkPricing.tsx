"use client";
import { storage } from "@omenai/appwrite-config";
import { SessionContext } from "@omenai/package-provider/SessionProvider";
import { uploadArtworkData } from "@omenai/shared-services/artworks/uploadArtworkData";
import uploadImage from "@omenai/shared-services/artworks/uploadArtworkImage";
import { artistArtworkUploadStore } from "@omenai/shared-state-store/src/artist/artwork_upload/artistArtworkUpload";
import { ArtistSchemaTypes, ArtworkMediumTypes } from "@omenai/shared-types";
import { createUploadedArtworkData } from "@omenai/shared-utils/src/createUploadedArtworkData";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import React, { FormEvent, useContext, useState } from "react";
import { toast } from "sonner";
import { fetchArtworkPriceForArtist } from "@omenai/shared-services/artworks/fetchArtworkPriceForArtist";
import { Alert, Paper } from "@mantine/core";
import { LoadSmall } from "@omenai/shared-ui-components/components/loader/Load";
import { formatPrice } from "@omenai/shared-utils/src/priceFormatter";
import { TriangleAlert } from "lucide-react";
import ArtworkPricingSkeleton from "@omenai/shared-ui-components/components/skeletons/ArtworkPricingSkeleton";
import Link from "next/link";
function extractNumberString(str: string) {
  if (!str) return ""; // handle empty or null input

  const cleaned = str.trim().replace(/[^\d.]/g, ""); // keep only digits and dot

  return cleaned;
}
export default function ArtworkPricing() {
  const { image, setImage, artworkUploadData, clearData } =
    artistArtworkUploadStore();

  const [loading, setLoading] = useState(false);
  const { session } = useContext(SessionContext);
  const router = useRouter();
  const queryClient = useQueryClient();
  const artwork_height = extractNumberString(artworkUploadData.height);
  const artwork_width = extractNumberString(artworkUploadData.width);

  const { data: pricing, isLoading } = useQuery({
    queryKey: ["fetch_artwork_price"],
    queryFn: async () => {
      console.log(
        artworkUploadData.medium as ArtworkMediumTypes,
        (session as ArtistSchemaTypes).categorization,
        artwork_height,
        artwork_width,
        (session as ArtistSchemaTypes).base_currency
      );
      const response = await fetchArtworkPriceForArtist(
        artworkUploadData.medium as ArtworkMediumTypes,
        (session as ArtistSchemaTypes).categorization,
        artwork_height,
        artwork_width,
        (session as ArtistSchemaTypes).base_currency
      );

      if (response === undefined || !response.isOk)
        throw new Error("Unable to fetch price data. Please contact support");

      return response.data;
    },
    refetchOnWindowFocus: false,
  });
  const handleArtworkUpload = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    if (!image) {
      toast.error("Error notification", {
        description: "Please select an image",
        style: {
          background: "red",
          color: "white",
        },
        className: "class",
      });
      setLoading(false);
      return;
    }

    try {
      const fileUploaded = await uploadImage(image);

      if (!fileUploaded) {
        throw new Error("Image upload failed");
      }

      const file = {
        bucketId: fileUploaded.bucketId,
        fileId: fileUploaded.$id,
      };

      const data = createUploadedArtworkData(
        {
          ...artworkUploadData,
          price: pricing.price,
          usd_price: pricing.usd_price,
          shouldShowPrice: pricing.shouldShowPrice,
          currency: pricing.currency,
        },
        file.fileId,
        ((session as ArtistSchemaTypes).artist_id as string) ?? "",
        {
          role: "artist",
          designation: (session as ArtistSchemaTypes).categorization,
        }
      );

      const uploadResponse = await uploadArtworkData(data);

      if (!uploadResponse?.isOk) {
        await storage.deleteFile(
          process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!,
          file.fileId
        );
        toast.error("Error notification", {
          description: uploadResponse?.body.message,
          style: {
            background: "red",
            color: "white",
          },
          className: "class",
        });
        setImage(null);
        return;
      }

      toast.success("Operation successful", {
        description: uploadResponse.body.message,
        style: {
          background: "green",
          color: "white",
        },
        className: "class",
      });
      queryClient.invalidateQueries();
      clearData();
      router.replace("/artist/app/artworks");
    } catch (error) {
      console.error("Error uploading artwork:", error);
      toast.error("Error notification", {
        description:
          "An error occurred while uploading the artwork. Please try again.",
        style: {
          background: "red",
          color: "white",
        },
        className: "class",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleArtworkUpload}
      className="bg-[#f8f8f8] p-10 rounded-[20px] flex flex-col"
    >
      {isLoading ? (
        <ArtworkPricingSkeleton />
      ) : (
        <>
          <h1 className="font-bold text-base">Proposed Artwork Price</h1>
          <Paper
            radius="lg"
            className="flex flex-col space-y-2 p-5 my-6"
            withBorder
          >
            <p className="text-[14px]">Omenai will list your art piece for</p>
            <h1 className="text-md font-bold">
              {formatPrice(pricing.usd_price, "USD")}
            </h1>
            <p className="text-xs font-medium">
              ({pricing.currency} equivalent:{" "}
              <span className="font-bold text-[14px]">
                {formatPrice(pricing.price, pricing.currency)})
              </span>
            </p>
          </Paper>
          <p className="text-xs font-medium">
            If you agree with the price, you can proceed to upload your piece.
            If not, tap cancel to review your details.
          </p>

          <div className="my-4">
            <Alert
              variant="light"
              color="yellow"
              radius="lg"
              title="Please note"
              icon={<TriangleAlert strokeWidth={1.5} absoluteStrokeWidth />}
              className="font-medium"
            >
              Uploading this piece confirms your agreement to sell it
              exclusively through Omenai
            </Alert>
          </div>

          <div className="w-full flex justify-between items-center gap-x-4 mb-2 mt-6">
            <Link href={"/artist/app/artworks/upload"} className="w-fit h-fit">
              <button className="h-[35px] p-5 rounded-full w-full flex items-center justify-center gap-3 disabled:cursor-not-allowed disabled:bg-dark/10 disabled:text-[#A1A1A1] bg-white hover:bg-[#f1f1f1] text-dark ring-1 ring-dark text-[14px] font-normal whitespace-nowrap">
                Cancel
              </button>
            </Link>

            <button
              type="submit"
              disabled={loading}
              className="h-[35px] p-5 rounded-full w-full flex items-center justify-center gap-3 disabled:cursor-not-allowed disabled:bg-dark/10 disabled:text-[#A1A1A1] bg-dark text-white text-[14px] hover:bg-dark/90 font-normal whitespace-nowrap"
            >
              {loading ? <LoadSmall /> : "Upload"}
            </button>
          </div>
        </>
      )}
    </form>
  );
}
