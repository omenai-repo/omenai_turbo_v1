import React from "react";

interface FilterOption {
  label: string;
  value: string;
  count: number;
}

interface FilterSidebarProps {
  activeTab: "artist" | "collector";
  filters: any;
  setFilters: (f: any) => void;
  facets?: {
    sources: FilterOption[];
    countries: FilterOption[];
    primary_kpi: FilterOption[];
    secondary_kpi: FilterOption[];
  };
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  activeTab,
  filters,
  setFilters,
  facets,
}) => {
  // Helper to toggle a specific filter
  const handleFilter = (category: string, value: string) => {
    setFilters((prev: any) => ({
      ...prev,
      // If clicking the active one, remove it (toggle off). Else set it.
      [category]: prev[category] === value ? undefined : value,
    }));
  };

  if (!facets)
    return (
      <div className="w-64 p-6 text-slate-400 text-sm">Loading Filters...</div>
    );

  return (
    <div className="w-64 bg-white border-r border-slate-200 p-6 flex-shrink-0 min-h-[600px] overflow-y-auto">
      {/* SECTION 1: SMART SEGMENTS (KPIs) */}
      <h3 className="text-xs font-bold uppercase text-slate-400 mb-4 tracking-wider">
        {activeTab === "collector" ? "Buying Frequency" : "Education"}
      </h3>
      <div className="space-y-2 mb-6">
        {facets.primary_kpi.map((option) => (
          <FilterButton
            key={option.value}
            label={option.label}
            count={option.count}
            active={
              filters[
                activeTab === "collector"
                  ? "buying_frequency"
                  : "formal_education"
              ] === option.value
            }
            onClick={() =>
              handleFilter(
                activeTab === "collector"
                  ? "buying_frequency"
                  : "formal_education",
                option.value,
              )
            }
          />
        ))}
      </div>

      {/* SECTION 2: ACQUISITION SOURCE */}
      <h3 className="text-xs font-bold uppercase text-slate-400 mb-4 tracking-wider">
        Traffic Source
      </h3>
      <div className="space-y-2 mb-6">
        {facets.sources.map((option) => (
          <FilterButton
            key={option.value}
            label={option.label} // e.g., "linkedin", "twitter"
            count={option.count}
            active={filters.source === option.value}
            onClick={() => handleFilter("source", option.value)}
          />
        ))}
      </div>

      {/* SECTION 3: COUNTRY (Dropdown Style) */}
      <h3 className="text-xs font-bold uppercase text-slate-400 mb-4 tracking-wider">
        Region
      </h3>
      <div className="mb-6">
        <select
          className="w-full p-2 border border-slate-300 rounded text-sm bg-slate-50 text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
          value={filters.country || ""}
          onChange={(e) => handleFilter("country", e.target.value)}
        >
          <option value="">All Countries</option>
          {facets.countries.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label} ({c.count})
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

// Reusable Button Component
const FilterButton = ({ label, count, active, onClick }: any) => (
  <button
    onClick={onClick}
    className={`w-full flex justify-between items-center px-3 py-2 text-sm rounded-md transition-all capitalize ${
      active
        ? "bg-blue-600 text-white shadow-md transform scale-[1.02]"
        : "text-slate-600 hover:bg-slate-100"
    }`}
  >
    <span className="truncate mr-2">{label || "Unknown"}</span>
    <span
      className={`text-xs px-2 py-0.5 rounded-full ${
        active ? "bg-blue-500 text-white" : "bg-slate-200 text-slate-500"
      }`}
    >
      {count}
    </span>
  </button>
);
