"use client";

import { useState, useEffect, useCallback } from "react";
import { toast_notif } from "@omenai/shared-utils/src/toast_notification";
import { ISupportTicket } from "@omenai/shared-types";
import { fetchSupportTickets } from "@omenai/shared-services/admin/fetchSupportTickets";
import { TicketFilters } from "./TicketFilters";
import { TicketPagination } from "./TicketPagination";
import { TicketStats } from "./TicketStats";
import { TicketTable } from "./TicketTable";

export default function SupportTicketsPage() {
  // --- STATE ---
  const [data, setData] = useState<ISupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 15,
    total: 0,
    totalPages: 1,
  });

  // Filters
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // --- FETCH LOGIC ---
  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      // Construct Query Params
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        status: statusFilter,
        priority: priorityFilter,
      });
      if (searchQuery) params.append("search", searchQuery);

      const response = await fetchSupportTickets(params);

      if (response.success) {
        setData(response.data);
        setPagination((prev) => ({ ...prev, ...response.pagination }));
      } else {
        toast_notif(response.message || "Failed to fetch tickets", "error");
      }
    } catch (error) {
      toast_notif("Network Error", "error");
    } finally {
      setLoading(false);
    }
  }, [pagination.page, statusFilter, priorityFilter, searchQuery]); // Dependencies trigger re-fetch

  // Initial Load
  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  return (
    <div className=" max-w-[1600px] mx-auto space-y-8">
      {/* 1. Header & Stats */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
            Support Tickets
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage and resolve customer inquiries.
          </p>
        </div>
        <TicketStats data={data} />
      </div>

      {/* 2. Toolbar */}
      <TicketFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        priorityFilter={priorityFilter}
        setPriorityFilter={setPriorityFilter}
        onRefresh={fetchTickets}
        onSearchSubmit={fetchTickets}
      />

      {/* 3. Table & Pagination */}
      <div>
        <TicketTable loading={loading} data={data} />
        <TicketPagination
          page={pagination.page}
          limit={pagination.limit}
          total={pagination.total}
          totalPages={pagination.totalPages}
          loading={loading}
          onPageChange={(p) => setPagination((prev) => ({ ...prev, page: p }))}
        />
      </div>
    </div>
  );
}
