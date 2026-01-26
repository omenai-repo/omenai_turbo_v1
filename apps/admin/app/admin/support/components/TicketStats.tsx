import { ISupportTicket } from "@omenai/shared-types";

export function TicketStats({ data }: { data: ISupportTicket[] }) {
  // Simple client-side stats for current page (or pass total stats from backend if available)
  const stats = {
    open: data.filter((t) => t.status === "OPEN").length,
    high: data.filter((t) => t.priority === "HIGH").length,
  };

  return (
    <div className="flex gap-3">
      <div className="px-4 py-2 bg-white border border-slate-200 rounded-lg shadow-sm flex flex-col items-center min-w-[100px]">
        <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
          Open
        </span>
        <span className="text-xl font-bold text-emerald-600">{stats.open}</span>
      </div>
      <div className="px-4 py-2 bg-white border border-slate-200 rounded-lg shadow-sm flex flex-col items-center min-w-[100px]">
        <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
          Urgent
        </span>
        <span className="text-xl font-bold text-rose-600">{stats.high}</span>
      </div>
    </div>
  );
}
