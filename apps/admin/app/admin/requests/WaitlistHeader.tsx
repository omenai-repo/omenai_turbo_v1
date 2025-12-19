import { Button } from "@mantine/core";
import { LoadSmall } from "@omenai/shared-ui-components/components/loader/Load";

interface WaitlistHeaderProps {
  allSelected: boolean;
  someSelected: boolean;
  filteredItemsLength: number;
  selectedCount: number;
  isInviting: boolean;
  searchQuery: string;
  onSelectAll: () => void;
  onSearchChange: (query: string) => void;
  onInviteClick: () => void;
}

export function WaitlistHeader({
  allSelected,
  someSelected,
  filteredItemsLength,
  selectedCount,
  isInviting,
  searchQuery,
  onSelectAll,
  onSearchChange,
  onInviteClick,
}: WaitlistHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-3 px-4">
      <label className="flex items-center gap-2 cursor-pointer group">
        <input
          type="checkbox"
          disabled={filteredItemsLength === 0}
          checked={allSelected}
          ref={(input) => {
            if (input) input.indeterminate = someSelected;
          }}
          onChange={onSelectAll}
          aria-label={
            allSelected
              ? "Deselect all items"
              : someSelected
                ? "Select all items (some currently selected)"
                : "Select all items"
          }
          className="w-5 h-5 rounded border border-black text-slate-900 
            focus:ring-2 focus:ring-slate-500 focus:ring-offset-0 
            cursor-pointer transition-all duration-200
            group-hover:border-slate-400"
        />
        <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
          {allSelected ? "Deselect All" : "Select All"}
        </span>
      </label>

      <div className="flex gap-8 items-center">
        <div>
          <input
            type="text"
            value={searchQuery}
            className="w-full bg-transparent border border-slate-300 focus:border-dark outline-none focus:ring-0 rounded-full transition-all duration-300 text-fluid-xxs font-normal text-dark disabled:bg-dark/10 px-4 disabled:bg-gray-50 disabled:border-dark/20 disabled:text-slate-700 disabled:cursor-not-allowed"
            placeholder="Search by name or email"
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <Button
          disabled={selectedCount === 0 || isInviting}
          onClick={onInviteClick}
          variant="gradient"
          gradient={{ from: "#0f172a", to: "#0f172a", deg: 45 }}
          size="xs"
          radius="sm"
          className="font-normal text-fluid-xxs px-4 py-2.5 shadow-lg hover:shadow-xl
            transition-all duration-300 hover:scale-105 active:scale-95
            ring-1 ring-blue-200/50 hover:ring-blue-300/70
            transform-gpu"
          styles={{
            root: {
              "&:hover": {
                transform: "translateY(-2px)",
              },
            },
          }}
        >
          {isInviting ? <LoadSmall /> : `Invite Selected (${selectedCount})`}
        </Button>
      </div>
    </div>
  );
}
