"use client";
import { ISupportTicket } from "@omenai/shared-types";
import { toast_notif } from "@omenai/shared-utils/src/toast_notification";
import { Icons, PriorityBadge, StatusBadge } from "../utils";
import { useRouter } from "next/navigation";

interface TicketTableProps {
  loading: boolean;
  data: ISupportTicket[];
}

export function TicketTable({ loading, data }: TicketTableProps) {
  const router = useRouter();
  const handleView = (id: string) => {
    toast_notif(`Opening Ticket ${id}...`, "success");
    router.push(`/admin/support/${id}`);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-100">
          <thead className="bg-slate-50/50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Ticket ID
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                User / Entity
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Priority
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-100">
            {loading ? (
              // Skeleton
              [...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-6 py-4">
                    <div className="h-4 bg-slate-100 rounded w-20"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 bg-slate-100 rounded w-32"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 bg-slate-100 rounded w-24"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-6 bg-slate-100 rounded w-16"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-6 bg-slate-100 rounded w-16"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 bg-slate-100 rounded w-24"></div>
                  </td>
                  <td className="px-6 py-4"></td>
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-12 text-center text-slate-400 text-sm"
                >
                  No tickets found matching your criteria.
                </td>
              </tr>
            ) : (
              data.map((ticket) => (
                <tr
                  key={ticket._id}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-mono text-sm text-slate-900 font-medium">
                      {ticket.ticketId}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-slate-900">
                        {ticket.userEmail}
                      </span>
                      <span className="text-xs text-slate-500 capitalize">
                        {ticket.userType.toLowerCase()}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 flex flex-col whitespace-nowrap">
                    <span className="text-sm text-slate-700">
                      {ticket.category.replace("_", " ")}
                    </span>
                    {ticket.referenceId && (
                      <span className="text-xs text-slate-400 font-mono">
                        #{ticket.referenceId}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <PriorityBadge priority={ticket.priority} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={ticket.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {new Date(ticket.createdAt).toLocaleDateString()}
                    <span className="text-xs ml-1 text-slate-400">
                      {new Date(ticket.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleView(ticket.ticketId)}
                      className="text-white bg-dark hover:bg-dark/80 rounded transition-colors px-4 py-2"
                      title="View Details"
                    >
                      View ticket
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
