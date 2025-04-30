"use client";
import ArtworkDimensionsInputGroup from "./components/ArtworkDimensionsInputGroup";
import ArtworkInfoInputGroup from "./components/ArtworkInfoInputGroup";

import { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { allKeysEmpty } from "@omenai/shared-utils/src/checkIfObjectEmpty";
import ArtistInfoInputGroup from "./components/ArtistInfoInputGroup";
import { artistArtworkUploadStore } from "@omenai/shared-state-store/src/artist/artwork_upload/artistArtworkUpload";
export default function UploadArtworkDetails() {
  const router = useRouter();
  const { errorFields, artworkUploadData } = artistArtworkUploadStore();

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
      console.log(artworkUploadData);

      toast.info("Operation in progress", {
        description: "Processing, please wait",
      });
      router.push("/artist/app/artworks/upload/image");
    }
  }
  return (
    <div className="">
      {/* Details inputs */}
      <form onSubmit={handleFormSubmit}>
        <ArtworkInfoInputGroup />
        <ArtistInfoInputGroup />
        <ArtworkDimensionsInputGroup />
        <div className="w-full flex justify-center mb-4 text-fluid-xs">
          <button
            type="submit"
            className="h-[35px] p-5 rounded-full w-fit self-end flex items-center justify-end gap-3 disabled:cursor-not-allowed disabled:bg-dark/10 disabled:text-[#A1A1A1] bg-dark text-white text-fluid-xs font-normal"
          >
            Proceed
          </button>
        </div>
      </form>
    </div>
  );
}
