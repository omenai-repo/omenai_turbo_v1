"use client";

import { useEffect, useState, useCallback } from "react";
import { format } from "date-fns";
import { fetchUserSupportTickets } from "@omenai/shared-services/support/fetchUserSupportTickets";
import { Icons, PriorityBadge, UserStatusBadge } from "./util";

export default function UserSupportHistory({ id }: { id: string }) {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [priority, setPriority] = useState("ALL");
  const [year, setYear] = useState("ALL");

  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        status,
        priority,
        year,
        id,
      });
      if (search) params.append("search", search);

      const result = await fetchUserSupportTickets(params);

      if (result.success && result.isOk) {
        setTickets(result.data);
        setPagination({
          total: result.pagination.total,
          totalPages: result.pagination.totalPages,
        });
      }
    } catch (error) {
      console.error("Failed to fetch history");
    } finally {
      setLoading(false);
    }
  }, [page, status, priority, year, search, id]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTickets();
    }, 400);
    return () => clearTimeout(timer);
  }, [fetchTickets]);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  // --- SUB-COMPONENT: Mobile Card Item ---
  const TicketCard = ({ ticket }: { ticket: any }) => (
    <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm space-y-3">
      <div className="flex justify-between items-start">
        <div>
          <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
            {ticket.ticketId}
          </span>
          <h4 className="font-medium text-slate-900 text-sm mt-1">
            {ticket.category.replace(/_/g, " ")}
          </h4>
        </div>
        <UserStatusBadge status={ticket.status} />
      </div>

      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
        {ticket.message}
      </p>

      {ticket.referenceId && (
        <div className="text-[10px] text-slate-400 font-mono">
          Ref: <span className="text-slate-600">{ticket.referenceId}</span>
        </div>
      )}

      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
        <PriorityBadge priority={ticket.priority} />
        <span className="text-[10px] text-slate-400">
          {format(new Date(ticket.createdAt), "MMM d, yyyy")}
        </span>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* 1. Header & Filters */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              Support History
            </h3>
            <p className="text-sm text-slate-500 mt-0.5">
              Track your past inquiries.
            </p>
          </div>

          {/* Search Bar - Full width on mobile */}
          <div className="relative w-full md:w-72">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Icons.Search />
            </div>
            <input
              type="text"
              placeholder="Search Tickets..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="block w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-slate-900 transition-colors"
            />
          </div>
        </div>

        {/* Filter Row - Grid on mobile, Flex on desktop */}
        <div className="pt-4 border-t border-slate-100">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex items-center gap-2 mb-2 md:mb-0">
              <span className="text-slate-400">
                <Icons.Filter />
              </span>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                Filters:
              </span>
            </div>

            <div className="grid grid-cols-2 md:flex gap-3 w-full md:w-auto">
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPage(1);
                }}
                className="w-full md:w-auto bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-lg px-3 py-2.5 focus:ring-1 focus:ring-slate-900 outline-none"
              >
                <option value="ALL">Status: All</option>
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
                <option value="CLOSED">Closed</option>
              </select>

              <select
                value={priority}
                onChange={(e) => {
                  setPriority(e.target.value);
                  setPage(1);
                }}
                className="w-full md:w-auto bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-lg px-3 py-2.5 focus:ring-1 focus:ring-slate-900 outline-none"
              >
                <option value="ALL">Priority: All</option>
                <option value="HIGH">High</option>
                <option value="NORMAL">Normal</option>
                <option value="LOW">Low</option>
              </select>

              <select
                value={year}
                onChange={(e) => {
                  setYear(e.target.value);
                  setPage(1);
                }}
                className="col-span-2 md:w-auto bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-lg px-3 py-2.5 focus:ring-1 focus:ring-slate-900 outline-none"
              >
                <option value="ALL">Year: All</option>
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Data Display */}
      <div className="min-h-[300px]">
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="bg-white border border-slate-100 rounded-xl p-6 animate-pulse flex flex-col gap-3"
              >
                <div className="h-4 w-1/3 bg-slate-100 rounded"></div>
                <div className="h-3 w-full bg-slate-50 rounded"></div>
              </div>
            ))}
          </div>
        ) : tickets.length === 0 ? (
          <div className="bg-white border border-dashed border-slate-200 rounded-xl p-12 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3 text-slate-300 text-xl">
              ?
            </div>
            <p className="text-sm font-medium text-slate-900">
              No tickets found
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Try adjusting your filters.
            </p>
            <button
              onClick={() => {
                setSearch("");
                setStatus("ALL");
                setPriority("ALL");
                setYear("ALL");
              }}
              className="mt-4 text-xs font-medium text-blue-600 hover:text-blue-700"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <>
            {/* VIEW A: Mobile Cards (Visible on Small Screens) */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
              {tickets.map((ticket) => (
                <TicketCard key={ticket._id} ticket={ticket} />
              ))}
            </div>

            {/* VIEW B: Desktop Table (Visible on Medium+ Screens) */}
            <div className="hidden md:block border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100">
                  <thead className="bg-slate-50/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Details
                      </th>
                      <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Priority
                      </th>
                      <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-right text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-100">
                    {tickets.map((ticket) => (
                      <tr
                        key={ticket._id}
                        className="group hover:bg-slate-50/80 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap align-top">
                          <span className="font-mono text-xs text-slate-600 font-medium bg-slate-50 px-2 py-1 rounded">
                            {ticket.ticketId}
                          </span>
                        </td>
                        <td className="px-6 py-4 align-top">
                          <div className="flex flex-col gap-1 max-w-xs">
                            <span className="text-sm text-slate-900 font-medium">
                              {ticket.category.replace(/_/g, " ")}
                            </span>
                            <p
                              className="text-xs text-slate-500 truncate"
                              title={ticket.message}
                            >
                              {ticket.message}
                            </p>
                            {ticket.referenceId && (
                              <span className="text-[10px] text-slate-400 font-mono">
                                Ref: {ticket.referenceId}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap align-top">
                          <PriorityBadge priority={ticket.priority} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap align-top">
                          <UserStatusBadge status={ticket.status} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right align-top text-xs text-slate-400">
                          {format(new Date(ticket.createdAt), "MMM d, yyyy")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      {/* 3. Pagination Footer */}
      {pagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <p className="text-xs text-slate-500 order-2 sm:order-1">
            Page <span className="font-medium text-slate-900">{page}</span> of{" "}
            {pagination.totalPages}
          </p>
          <div className="flex gap-2 order-1 sm:order-2 w-full sm:w-auto justify-center">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
              className="flex-1 sm:flex-none px-4 py-2 border border-slate-200 rounded-lg hover:bg-white bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-slate-600 flex items-center justify-center"
            >
              <Icons.ChevronLeft />
            </button>
            <button
              onClick={() =>
                setPage((p) => Math.min(pagination.totalPages, p + 1))
              }
              disabled={page === pagination.totalPages || loading}
              className="flex-1 sm:flex-none px-4 py-2 border border-slate-200 rounded-lg hover:bg-white bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-slate-600 flex items-center justify-center"
            >
              <Icons.ChevronRight />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
