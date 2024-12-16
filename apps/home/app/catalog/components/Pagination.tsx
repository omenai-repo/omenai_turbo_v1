"use client";

import { fetchPaginatedArtworks } from "@omenai/shared-services/artworks/fetchPaginatedArtworks";
import { artworkActionStore } from "@omenai/shared-state-store/src/artworks/ArtworkActionStore";
import { artworkStore } from "@omenai/shared-state-store/src/artworks/ArtworkStore";
import { filterStore } from "@omenai/shared-state-store/src/artworks/FilterStore";
import { toast } from "sonner";

export default function Pagination() {
  const { setArtworks, setIsLoading, pageCount, setPageCount } = artworkStore();

  const { updatePaginationCount, paginationCount } = artworkActionStore();

  const { filterOptions } = filterStore();

  async function handlePaginationArtworkFetch(type: "dec" | "inc") {
    setIsLoading(true);
    if (type === "dec") {
      const response = await fetchPaginatedArtworks(
        paginationCount - 1,
        filterOptions
      );
      if (response?.isOk) {
        setArtworks(response.data);
        updatePaginationCount(type);
        setPageCount(response.count);
      } else {
        toast.error("Error notification", {
          description: response?.message,
          style: {
            background: "red",
            color: "white",
          },
          className: "class",
        });
      }
    } else {
      const response = await fetchPaginatedArtworks(
        paginationCount + 1,
        filterOptions
      );
      if (response?.isOk) {
        setArtworks(response.data);
        updatePaginationCount(type);
        setPageCount(response.count);
      } else {
        toast.error("Error notification", {
          description: response?.message,
          style: {
            background: "red",
            color: "white",
          },
          className: "class",
        });
      }
    }
    setIsLoading(false);
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }
  return (
    <div className="w-full grid place-items-center mt-12">
      <p className="text-[14px] font-normal my-5">
        Showing page {pageCount === 0 ? 0 : paginationCount} of {pageCount}
      </p>
      <div className="flex gap-x-4 w-full">
        <button
          disabled={paginationCount === 1}
          onClick={() => handlePaginationArtworkFetch("dec")}
          className="bg-dark text-xs rounded-sm w-full text-white h-[50px] px-4 disabled:bg-dark/30 disabled:cursor-not-allowed"
        >
          Previous page
        </button>
        <button
          disabled={paginationCount === pageCount}
          onClick={() => handlePaginationArtworkFetch("inc")}
          className="bg-dark text-xs rounded-sm w-full text-white h-[50px] px-4 disabled:bg-dark/30 disabled:cursor-not-allowed"
        >
          Next page
        </button>
      </div>
    </div>
  );
}
