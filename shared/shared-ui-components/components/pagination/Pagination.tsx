"use client";
import React, { useCallback } from "react";
import { toast } from "sonner";
import debounce from "lodash.debounce";
import { IoIosArrowForward } from "react-icons/io";
import { IoIosArrowBack } from "react-icons/io";
import { ArtworkSchemaTypes, FilterOptions } from "@omenai/shared-types";
import { usePaginationRange } from "@omenai/shared-hooks/hooks/usePaginationRange";
import { useWindowSize } from "usehooks-ts";

interface PaginationProps {
  total: number; // Total number of pages
  filterOptions: FilterOptions;
  medium?: string;
  fn: (
    page: number,
    filterOptions: FilterOptions,
    medium?: string
  ) => Promise<
    | {
        isOk: boolean;
        message: string;
        data: ArtworkSchemaTypes[];
        total: number;
      }
    | undefined
  >;
  setArtworks: (artworks: ArtworkSchemaTypes[]) => void;
  setIsLoading: (loading: boolean) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  total,
  filterOptions,
  fn,
  setArtworks,
  setIsLoading,
  currentPage,
  setCurrentPage,
  medium,
}: PaginationProps) => {
  const { paginationRange } = usePaginationRange(currentPage, total);

  const { width } = useWindowSize();

  const fetchArtworkPaginationData = useCallback(
    debounce(async (page: number) => {
      setIsLoading(true);
      const response = medium
        ? await fn(page, filterOptions, medium) // Pass 3 arguments
        : await fn(page, filterOptions);
      if (response?.isOk) {
        setArtworks(response.data);
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
      setIsLoading(false);
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }, 300),
    [filterOptions] // Remove currentPage dependency
  );

  const handleClickPrev = async () => {
    const newPage = currentPage - 1; // Calculate the new page
    setCurrentPage(newPage); // Update the Zustand state
    await fetchArtworkPaginationData(newPage); // Pass the new page directly
  };

  const handleClickNext = async () => {
    const newPage = currentPage + 1; // Calculate the new page
    setCurrentPage(newPage); // Update the Zustand state
    await fetchArtworkPaginationData(newPage); // Pass the new page directly
  };

  const handleClickPage = async (page: number) => {
    setCurrentPage(page); // Update the Zustand state
    await fetchArtworkPaginationData(page); // Pass the selected page directly
  };

  return (
    <nav className="flex justify-center mb-12 mt-20 ">
      <ul className="flex items-center gap-x-2 ring-1 ring-dark/10 rounded-lg py-4 px-2">
        {/* Previous Button */}
        <li>
          <button
            className={`${width > 380 && "px-3 py-2 disabled:bg-dark/10 disabled:text-dark/50 rounded text-xs text-white bg-dark"} ${
              currentPage === 1
                ? "text-dark/80 cursor-not-allowed"
                : "text-dark"
            }`}
            disabled={currentPage === 1}
            onClick={handleClickPrev}
          >
            {width > 380 ? "Prev" : <IoIosArrowBack />}
          </button>
        </li>

        {/* Page Numbers */}
        {paginationRange.map((page, index) =>
          typeof page === "number" ? (
            <li key={index}>
              <button
                className={`px-3 py-1 rounded disabled:bg-dark/10 disabled:text-dark/50 disabled:cursor-not-allowed ${
                  page === currentPage
                    ? "bg-dark text-white"
                    : "text-dark hover:bg-dark/50"
                }`}
                onClick={() => handleClickPage(page)}
              >
                {page}
              </button>
            </li>
          ) : (
            <li key={index} className="px-3 py-1 text-gray-500">
              {page}
            </li>
          )
        )}

        {/* Next Button */}
        <li>
          <button
            className={`${width > 380 && " disabled:bg-dark/10 disabled:text-dark/50 px-3 py-2 rounded text-white text-xs bg-dark"}  ${
              currentPage === total
                ? "text-dark/80 cursor-not-allowed"
                : "text-dark"
            }`}
            disabled={currentPage === total}
            onClick={handleClickNext}
          >
            {width > 380 ? "Next" : <IoIosArrowForward />}
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Pagination;
