"use client";
import ArtworkDimensionsInputGroup from "./components/ArtworkDimensionsInputGroup";
import ArtworkInfoInputGroup from "./components/ArtworkInfoInputGroup";
import ArtworkPriceInputGroup from "./components/ArtworkPriceInputGroup";
import { BsArrowRight } from "react-icons/bs";
import { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { galleryArtworkUploadStore } from "@omenai/shared-state-store/src/gallery/gallery_artwork_upload/GalleryArtworkUpload";
import { allKeysEmpty } from "@omenai/shared-utils/src/checkIfObjectEmpty";
import ArtistInfoInputGroup from "./components/ArtistInfoInputGroup";
export default function UploadArtworkDetails() {
  const router = useRouter();
  const { errorFields } = galleryArtworkUploadStore();

  function handleFormSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!allKeysEmpty(errorFields))
      toast.error("Error notification", {
        description: "Invalid field inputs...",
        style: {
          background: "red",
          color: "white",
        },
        className: "class",
      });
    else {
      toast.info("Operation in progress", {
        description: "Processing, please wait",
      });
      router.push("/gallery/artworks/upload/image");
    }
  }
  return (
    <div className="">
      {/* Details inputs */}
      <form onSubmit={handleFormSubmit}>
        <ArtworkInfoInputGroup />
        <ArtistInfoInputGroup />
        <ArtworkDimensionsInputGroup />
        <ArtworkPriceInputGroup />
        <div className="w-full flex my-4 text-xs">
          <button
            type="submit"
            className="w-full bg-dark rounded-sm text-white h-[40px] px-4 flex gap-x-2 items-center justify-center hover:bg-dark/80"
          >
            <>
              Proceed
              <BsArrowRight />
            </>
          </button>
        </div>
      </form>
    </div>
  );
}
