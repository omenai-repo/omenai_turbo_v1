"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CiSearch } from "react-icons/ci";

export default function SearchInput({ setIsMobileMenuOpen }: any) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSearch = () => {
    if (!searchTerm.trim()) return;
    setIsMobileMenuOpen(false);
    startTransition(() => {
      router.push(`/search?searchTerm=${encodeURIComponent(searchTerm)}`);
    });
  };

  return (
    <div className="relative w-full md:w-64 group">
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        placeholder="SEARCH ARCHIVE..."
        className="w-full py-1 bg-transparent border border-neutral-300 text-[10px] tracking-[0.1em] text-dark placeholder:text-neutral-400 focus:outline-none focus:ring-0 outline-none focus:border-black transition-colors"
      />
      <button
        onClick={handleSearch}
        className="absolute right-1 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-dark transition-colors"
      >
        {isPending ? (
          <div className="h-3 w-3 border border-black border-t-transparent rounded animate-spin" />
        ) : (
          <CiSearch className="w-4 h-4" />
        )}
      </button>
    </div>
  );
}
