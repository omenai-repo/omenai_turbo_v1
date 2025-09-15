"use client";
import React, { useCallback } from "react";
import { toast } from "sonner";
import debounce from "lodash.debounce";
import { IoIosArrowForward, IoIosArrowBack } from "react-icons/io";
import { ArtworkSchemaTypes } from "@omenai/shared-types";
import { usePaginationRange } from "@omenai/shared-hooks/hooks/usePaginationRange";
import { useWindowSize } from "usehooks-ts";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";

// Allow generic argument list after `page`
type APIFunction<T extends any[]> = (
  page: number,
  ...args: T
) => Promise<
  | {
      isOk: boolean;
      message: string;
      data?: ArtworkSchemaTypes[];
      total?: number;
    }
  | undefined
>;

interface PaginationProps<T extends any[]> {
  total: number;
  fn: APIFunction<T>;
  fnArgs: T;
  setArtworks: (artworks: ArtworkSchemaTypes[]) => void;
  setIsLoading: (loading: boolean) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
}

function Pagination<T extends any[]>({
  total,
  fn,
  fnArgs,
  setArtworks,
  setIsLoading,
  currentPage,
  setCurrentPage,
}: PaginationProps<T>) {
  const { paginationRange } = usePaginationRange(currentPage, total);
  const { width } = useWindowSize();
  const { user } = useAuth({ requiredRole: "user" });

  const fetchData = useCallback(
    debounce(async (page: number) => {
      try {
        setIsLoading(true);
        const response = await fn(page, ...fnArgs);

        if (response?.isOk && response.data) {
          setArtworks(response.data);
        } else {
          toast.error("Error notification", {
            description: response?.message ?? "Something went wrong",
            style: { background: "red", color: "white" },
            className: "class",
          });
        }
      } finally {
        setIsLoading(false);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }, 300),
    [fn, fnArgs]
  );

  const handleClickPage = async (page: number) => {
    setCurrentPage(page);
    await fetchData(page);
  };

  return (
    <nav className="flex justify-center mb-12 mt-20">
      <ul className="flex items-center gap-x-2 ring-1 ring-dark/10 rounded py-4 px-2">
        {/* Prev */}
        <li>
          <button
            className={`${width > 380 && "px-3 py-1 disabled:bg-dark/10 disabled:text-dark/50 rounded text-fluid-xs text-white bg-dark"} ${
              currentPage === 1 ? "text-dark cursor-not-allowed" : "text-dark"
            }`}
            disabled={currentPage === 1}
            onClick={() => handleClickPage(currentPage - 1)}
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

        {/* Next */}
        <li>
          <button
            className={`${width > 380 && " disabled:bg-dark/10 disabled:text-dark/50 px-3 py-1 rounded text-white text-fluid-xs bg-dark"} ${
              currentPage === total
                ? "text-dark cursor-not-allowed"
                : "text-dark"
            }`}
            disabled={currentPage === total}
            onClick={() => handleClickPage(currentPage + 1)}
          >
            {width > 380 ? "Next" : <IoIosArrowForward />}
          </button>
        </li>
      </ul>
    </nav>
  );
}

export default Pagination;
