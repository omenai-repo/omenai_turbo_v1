"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2 } from "lucide-react";
import { INPUT_CLASS } from "../../styles/inputClasses";

export default function SearchInput({ setIsMobileMenuOpen }: any) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFocused, setIsFocused] = useState(false);
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
    <div className="relative w-full">
      <div
        className={`
          flex items-center gap-2 px-3 py-2
          bg-neutral-50 rounded-sm
          border transition-all duration-200 ease-out
          ${
            isFocused
              ? "bg-white border-neutral-300 shadow-sm"
              : "border-transparent hover:border-neutral-200 hover:bg-white/70"
          }
        `}
      >
        {isPending ? (
          <Loader2
            className="w-4 h-4 text-neutral-400 shrink-0 animate-spin"
            strokeWidth={1.5}
          />
        ) : (
          <Search
            className={`w-4 h-4 shrink-0 transition-colors duration-200 ${
              isFocused ? "text-neutral-600" : "text-neutral-400"
            }`}
            strokeWidth={1.5}
          />
        )}

        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Artists, artworks, styles..."
          className={INPUT_CLASS}
        />
      </div>
    </div>
  );
}
