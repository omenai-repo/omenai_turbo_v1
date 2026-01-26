import { SELECT_CLASS } from "@omenai/shared-ui-components/components/styles/inputClasses";
import { Icons } from "../utils";

interface TicketFiltersProps {
  searchQuery: string;
  setSearchQuery: (s: string) => void;
  statusFilter: string;
  setStatusFilter: (s: string) => void;
  priorityFilter: string;
  setPriorityFilter: (s: string) => void;
  onRefresh: () => void;
  onSearchSubmit: () => void;
}

export function TicketFilters({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  priorityFilter,
  setPriorityFilter,
  onRefresh,
  onSearchSubmit,
}: TicketFiltersProps) {
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap gap-4 items-center justify-between">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px] max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          <Icons.Search />
        </div>
        <input
          type="text"
          placeholder="Search by Ticket ID..."
          className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-0 focus:border-dark transition-colors sm:text-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSearchSubmit()}
        />
      </div>

      {/* Dropdowns */}
      <div className="flex items-center gap-3 overflow-x-auto">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className={SELECT_CLASS}
        >
          <option value="ALL">All Status</option>
          <option value="OPEN">Open</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="RESOLVED">Resolved</option>
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className={SELECT_CLASS}
        >
          <option value="ALL">All Priority</option>
          <option value="HIGH">High</option>
          <option value="NORMAL">Normal</option>
          <option value="LOW">Low</option>
        </select>

        <button
          onClick={onRefresh}
          className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          title="Refresh"
        >
          <Icons.Refresh />
        </button>
      </div>
    </div>
  );
}
