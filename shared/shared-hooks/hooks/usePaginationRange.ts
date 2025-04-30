"use client";
import { useState, useCallback, useEffect } from "react";
import { useWindowSize } from "usehooks-ts";
import debounce from "lodash.debounce";

export function usePaginationRange(currentPage: number, total: number) {
  const [visibleRange, setVisibleRange] = useState<number>(5); // Default range
  const { width } = useWindowSize();

  // Update the visible range based on screen size
  const updateVisibleRange = useCallback(() => {
    if (width <= 460) {
      setVisibleRange(2); // Extra small screens (e.g., mobile)
    } else if (width <= 640) {
      setVisibleRange(2); // Small screens (e.g., mobile)
    } else {
      setVisibleRange(5); // Medium screens (e.g., tablets)
    }
  }, []);

  useEffect(() => {
    updateVisibleRange(); // Set range on component mount
    window.addEventListener("resize", debounce(updateVisibleRange, 300));
    return () => window.removeEventListener("resize", updateVisibleRange);
  }, [updateVisibleRange]);

  // Calculate the pagination range
  const getPaginationRange = () => {
    const range: (number | string)[] = [];
    const halfRange = Math.floor(visibleRange / 2);

    // Always include the first page
    range.push(1);

    // Calculate range based on current page
    const left = Math.max(currentPage - halfRange, 2); // Start before current
    const right = Math.min(currentPage + halfRange, total - 1); // End after current

    if (left > 2) {
      range.push("...");
    }

    for (let i = left; i <= right; i++) {
      range.push(i);
    }

    if (right < total - 1) {
      range.push("...");
    }

    // Always include the last page
    if (total !== 1) range.push(total);

    return range;
  };

  const paginationRange = getPaginationRange();

  return { paginationRange };
}
