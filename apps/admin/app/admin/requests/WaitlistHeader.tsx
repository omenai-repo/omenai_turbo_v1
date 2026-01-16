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
}: Readonly<WaitlistHeaderProps>) {
  return (
    <div className="flex items-center justify-between gap-4">
      {/* Left: Selection */}
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            disabled={filteredItemsLength === 0}
            checked={allSelected}
            ref={(input) => {
              if (input) input.indeterminate = someSelected;
            }}
            onChange={onSelectAll}
            aria-label={allSelected ? "Deselect all" : "Select all"}
            className="
              h-4 w-4 rounded
              border border-neutral-300
              text-neutral-900
              transition
              focus:ring-2 focus:ring-neutral-400 focus:ring-offset-0
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          />

          <span className="text-sm text-neutral-700">
            {allSelected ? "Deselect all" : "Select all"}
          </span>
        </label>

        {selectedCount > 0 && (
          <span className="text-sm text-neutral-500">
            {selectedCount} selected
          </span>
        )}
      </div>

      {/* Right: Search + Action */}
      <div className="flex items-center gap-3">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search name or email"
          className="
            h-9 w-64
            rounded-full
            border border-neutral-200
            bg-white
            px-4 text-sm
            text-neutral-900
            placeholder:text-neutral-400
            transition
            focus:border-neutral-400 focus:outline-none
          "
        />

        <Button
          disabled={selectedCount === 0 || isInviting}
          onClick={onInviteClick}
          size="sm"
          radius="md"
          className="
            bg-neutral-900 text-white
            hover:bg-neutral-800
            disabled:bg-neutral-200 disabled:text-neutral-500
            transition
          "
        >
          {isInviting ? <LoadSmall /> : `Invite (${selectedCount})`}
        </Button>
      </div>
    </div>
  );
}
