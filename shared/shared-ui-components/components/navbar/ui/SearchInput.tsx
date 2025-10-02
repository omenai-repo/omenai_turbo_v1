import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useState, useTransition } from "react";
import { CiSearch } from "react-icons/ci";
import { toast } from "sonner";
import { fetchSearchKeyWordResults } from "@omenai/shared-services/search/fetchSearchKeywordResults";

export default function SearchInput() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const queryClient = useQueryClient();

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      toast.error("Please include a search term");
      return;
    }

    // Prefetch so results are cached instantly
    queryClient.prefetchQuery({
      queryKey: ["search_results", searchTerm],
      queryFn: () =>
        fetchSearchKeyWordResults(searchTerm).then((r) => r?.data || []),
    });

    startTransition(() => {
      router.push(`/search?searchTerm=${encodeURIComponent(searchTerm)}`);
    });
  };

  return (
    <div className="relative flex w-auto items-center rounded border bg-transparent border-dark/30">
      <input
        type="text"
        className="w-full h-[35px] bg-transparent px-3 border-none rounded placeholder:text-sm placeholder:text-dark focus:ring-0"
        placeholder="Search for anything"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
      />
      <button
        disabled={isPending}
        className="flex items-center bg-dark rounded text-white px-3 py-2 mr-0.5 disabled:opacity-50"
        onClick={handleSearch}
      >
        <CiSearch className="text-white" />
      </button>
    </div>
  );
}
