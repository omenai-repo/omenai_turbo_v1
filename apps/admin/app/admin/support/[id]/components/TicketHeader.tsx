"use client";
import { useRouter } from "next/navigation";
import { StatusBadge } from "../../utils";

interface TicketHeaderProps {
  ticket: any;
  onUpdateStatus: (newStatus: string) => void;
  onUpdatePriority: (newPriority: string) => void;
  saving: boolean;
}

export function TicketHeader({
  ticket,
  onUpdateStatus,
  onUpdatePriority,
  saving,
}: TicketHeaderProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5"></path>
            <path d="M12 19l-7-7 7-7"></path>
          </svg>
        </button>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {ticket.ticketId}
            </h1>
            <StatusBadge status={ticket.status} />
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Created on {new Date(ticket.createdAt).toLocaleDateString()} by{" "}
            <span className="font-medium text-slate-700">
              {ticket.userEmail}
            </span>
          </p>
        </div>
      </div>

      {/* Actions Toolbar */}
      <div className="flex items-center gap-3">
        <select
          value={ticket.status}
          onChange={(e) => onUpdateStatus(e.target.value)}
          disabled={saving}
          className="bg-white border border-slate-200 text-slate-700 text-sm rounded-lg p-2.5 focus:ring-1 focus:ring-slate-900 outline-none cursor-pointer"
        >
          <option value="OPEN">Mark as Open</option>
          <option value="IN_PROGRESS">Mark In Progress</option>
          <option value="RESOLVED">Mark Resolved</option>
          <option value="CLOSED">Close Ticket</option>
        </select>

        <select
          value={ticket.priority}
          onChange={(e) => onUpdatePriority(e.target.value)}
          disabled={saving}
          className="bg-white border border-slate-200 text-slate-700 text-sm rounded-lg p-2.5 focus:ring-1 focus:ring-slate-900 outline-none cursor-pointer"
        >
          <option value="LOW">Low Priority</option>
          <option value="NORMAL">Normal Priority</option>
          <option value="HIGH">High Priority</option>
        </select>
      </div>
    </div>
  );
}
