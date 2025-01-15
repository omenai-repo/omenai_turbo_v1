"use client";

import { fetchArtworksByCriteria } from "@omenai/shared-services/artworks/fetchArtworksByCriteria";
import { collectionsFilterStore } from "@omenai/shared-state-store/src/collections/collectionsFilterStore";
import { collectionsStore } from "@omenai/shared-state-store/src/collections/collectionsStore";
import { toast } from "sonner";

export default function Pagination({ medium }: { medium: string }) {
  const {
    setArtworks,
    setPaginationLoading,
    paginationLoading,
    paginationCount,
    setPaginationCount,
    pageCount,
    setIsLoading,
  } = collectionsStore();

  const { filterOptions } = collectionsFilterStore();

  async function handlePaginationArtworkFetch(type: "dec" | "inc") {
    setPaginationLoading(true);
    setIsLoading(true);
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
    if (type === "dec") {
      const response = await fetchArtworksByCriteria(
        medium,
        paginationCount - 1,
        filterOptions
      );
      if (response?.isOk) {
        setArtworks(response.data);
        // updatePaginationCount(type);
        setPaginationCount(paginationCount - 1);
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
      const response = await fetchArtworksByCriteria(
        medium,
        paginationCount + 1,
        filterOptions
      );
      if (response?.isOk) {
        setArtworks(response.data);
        // updatePaginationCount(type);
        setPaginationCount(paginationCount + 1);
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
    setPaginationLoading(false);
    setIsLoading(false);
  }
  return (
    <div className="w-full grid place-items-center mt-12">
      <p className="text-[14px] font-normal my-5">
        Showing page {pageCount === 0 ? 0 : paginationCount} of {pageCount}
      </p>
      <div className="flex gap-x-4 w-full">
        <button
          disabled={paginationCount === 1 || paginationLoading}
          onClick={() => handlePaginationArtworkFetch("dec")}
          className="bg-dark text-[14px] rounded-sm w-full text-white h-[50px] px-4 disabled:bg-dark/30 disabled:cursor-not-allowed"
        >
          Previous page
        </button>
        <button
          disabled={paginationCount === pageCount || paginationLoading}
          onClick={() => handlePaginationArtworkFetch("inc")}
          className="bg-dark text-[14px] rounded-sm w-full text-white h-[50px] px-4 disabled:bg-dark/30 disabled:cursor-not-allowed"
        >
          Next page
        </button>
      </div>
    </div>
  );
}
