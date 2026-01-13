"use client";

export function TransactionFilters({
  onFilterChange,
}: {
  onFilterChange: (range: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-3 mb-6">
      {["30d", "90d", "6m", "all"].map((range) => (
        <button
          key={range}
          onClick={() => onFilterChange(range)}
          className="rounded-full px-4 py-2 text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
        >
          {range === "all" ? "All time" : range}
        </button>
      ))}
    </div>
  );
}
