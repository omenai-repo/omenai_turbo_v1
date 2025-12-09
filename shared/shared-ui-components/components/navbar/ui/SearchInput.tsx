"use client";

import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useState, useTransition, useCallback } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { fetchSearchKeyWordResults } from "@omenai/shared-services/search/fetchSearchKeywordResults";
import { icons } from "./icons";
import { CiSearch } from "react-icons/ci";
import debounce from "lodash.debounce";

export default function SearchInput({
  setIsMobileMenuOpen,
}: {
  setIsMobileMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const queryClient = useQueryClient();

  const debouncedPrefetch = useCallback(
    debounce((term: string) => {
      if (!term.trim()) return;
      queryClient.prefetchQuery({
        queryKey: ["search_results", term],
        queryFn: () =>
          fetchSearchKeyWordResults(term).then((r) => r?.data || []),
      });
    }, 500),
    []
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    debouncedPrefetch(term);
  };

  const handleSearch = () => {
    setIsMobileMenuOpen(false);

    if (!searchTerm.trim()) {
      toast.error("Please include a search term");
      return;
    }
    startTransition(() => {
      router.push(`/search?searchTerm=${encodeURIComponent(searchTerm)}`);
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="relative w-full md:w-72"
    >
      {/* Search Input */}
      <input
        type="text"
        value={searchTerm}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Search artworks, artists..."
        className="w-full py-2 pl-4 pr-10 bg-slate-800 border border-slate-700 rounded-full text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-300 placeholder:text-fluid-xxs placeholder:text-white"
      />

      {/* Search Button with spinner inside */}
      <button
        onClick={handleSearch}
        disabled={isPending}
        className="absolute right-1 top-1/2 -translate-y-1/2 p-1 flex items-center justify-center text-white rounded hover:bg-slate-700 transition disabled:opacity-50 w-8 h-8"
        aria-label="Search"
      >
        {isPending ? (
          <div className="h-4 w-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
        ) : (
          <CiSearch className="w-5 h-5" />
        )}
      </button>
    </motion.div>
  );
}
