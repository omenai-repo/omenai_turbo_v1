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
    <div className="relative w-full group">
      {/* Search Icon - Moved to left for standard utility feel */}
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-dark  transition-colors pointer-events-none">
        <CiSearch className="w-5 h-5" />
      </div>

      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        // More descriptive placeholder, no uppercase yelling
        placeholder="Search artists, artworks, styles..."
        className="
            w-full pl-10 pr-4 py-2.5 
            bg-slate-100 border border-transparent rounded-md 
            text-sm font-sans text-slate-900 placeholder:text-slate-500 
            focus:outline-none focus:bg-white focus:border-slate-200 focus:ring-0 focus:border-dark
            transition-all duration-200
        "
      />

      {/* Loading Indicator - Right aligned */}
      {isPending && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <div className="h-4 w-4 border-2 border-[#091830] border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
