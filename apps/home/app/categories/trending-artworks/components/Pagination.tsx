"use client";

import { fetchTrendingArtworks } from "@omenai/shared-services/artworks/fetchTrendingArtworks";
import { categoriesFilterStore } from "@omenai/shared-state-store/src/categories/categoriesFilterStore";
import { categoriesStore } from "@omenai/shared-state-store/src/categories//categoriesStore";
import { toast } from "sonner";

export default function Pagination() {
  const {
    setArtworks,
    setPaginationLoading,
    setIsLoading,
    paginationCount,
    setPaginationCount,
    pageCount,
  } = categoriesStore();

  const { filterOptions } = categoriesFilterStore();

  async function handlePaginationArtworkFetch(type: "dec" | "inc") {
    setIsLoading(true);
    if (type === "dec") {
      const response = await fetchTrendingArtworks(
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
      const response = await fetchTrendingArtworks(
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
    setIsLoading(false);
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }
  return (
    <div className="w-full grid place-items-center mt-12">
      <p className="text-[14px] font-normal my-5">
        Showing page {paginationCount} of {pageCount}
      </p>
      <div className="flex gap-x-4 w-full">
        <button
          disabled={paginationCount === 1}
          onClick={() => handlePaginationArtworkFetch("dec")}
          className="bg-dark text-[14px] rounded-sm w-full text-white h-[50px] px-4 disabled:bg-dark/30 disabled:cursor-not-allowed"
        >
          Previous page
        </button>
        <button
          disabled={paginationCount === pageCount}
          onClick={() => handlePaginationArtworkFetch("inc")}
          className="bg-dark text-[14px] rounded-sm w-full text-white h-[50px] px-4 disabled:bg-dark/30 disabled:cursor-not-allowed"
        >
          Next page
        </button>
      </div>
    </div>
  );
}
