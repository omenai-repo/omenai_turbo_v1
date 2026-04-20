"use client";
import ArtworkDimensionsInputGroup from "./components/ArtworkDimensionsInputGroup";
import ArtworkInfoInputGroup from "./components/ArtworkInfoInputGroup";
import ArtworkPriceInputGroup from "./components/ArtworkPriceInputGroup";
import { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { galleryArtworkUploadStore } from "@omenai/shared-state-store/src/gallery/gallery_artwork_upload/GalleryArtworkUpload";
import { allKeysEmpty } from "@omenai/shared-utils/src/checkIfObjectEmpty";
import ArtistInfoInputGroup from "./components/ArtistInfoInputGroup";
import { toast_notif } from "@omenai/shared-utils/src/toast_notification";
export default function UploadArtworkDetails({
  isPremium,
}: {
  isPremium: boolean;
}) {
  const router = useRouter();
  const { errorFields, artworkUploadData } = galleryArtworkUploadStore();

  function handleFormSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!artworkUploadData.usd_price) {
      toast_notif(
        "Please convert the price to USD before proceeding.",
        "error",
      );
      return;
    }
    if (!artworkUploadData.artist) {
      toast_notif("Please provide an artist name before proceeding.", "error");
      return;
    }
    if (!allKeysEmpty(errorFields)) {
      toast_notif(
        "Please fix the errors in the form before proceeding.",
        "error",
      );
      return;
    }
    toast.info("Operation in progress", {
      description: "Processing, please wait",
    });
    router.push("/gallery/artworks/upload/image");
  }
  return (
    <div className="">
      {/* Details inputs */}
      <form onSubmit={handleFormSubmit}>
        <ArtworkInfoInputGroup />
        <ArtistInfoInputGroup />
        <ArtworkDimensionsInputGroup />
        <ArtworkPriceInputGroup isPremium={isPremium} />
        <div className="w-full flex justify-center mb-4 text-fluid-xxs">
          <button
            type="submit"
            className="h-[35px] p-5 rounded-sm  w-fit self-end flex items-center justify-end gap-3 disabled:cursor-not-allowed disabled:bg-dark/10 disabled:text-[#A1A1A1] bg-dark text-white text-fluid-xxs font-normal"
          >
            Proceed
          </button>
        </div>
      </form>
    </div>
  );
}
