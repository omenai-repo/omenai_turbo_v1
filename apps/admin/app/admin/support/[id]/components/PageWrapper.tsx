"use client";
import { useEffect, useState, useCallback } from "react";
import { toast_notif } from "@omenai/shared-utils/src/toast_notification";
import { TicketHeader } from "./TicketHeader";
import { TicketInfoCard } from "./TicketInfoCard";
import { TicketMessage } from "./TicketMessage";
import { fetchSingleSupportTicket } from "@omenai/shared-services/admin/fetchSingleSupportTicket";
import { patchSupportTicket } from "@omenai/shared-services/admin/patchSupportTicket";
export default function SingleTicketPage({ id }: { id: string }) {
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch Ticket
  const fetchTicket = useCallback(async () => {
    try {
      const res = await fetchSingleSupportTicket(id);
      if (res.success && res.isOk) {
        setTicket(res.data);
      } else {
        toast_notif("Ticket not found", "error");
      }
    } catch (error) {
      toast_notif("Failed to load ticket", "error");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTicket();
  }, [fetchTicket]);

  const handleUpdate = async (updates: {
    status?: string;
    priority?: string;
  }) => {
    setSaving(true);
    // Optimistic UI Update
    setTicket((prev: any) => ({ ...prev, ...updates }));

    try {
      const res = await patchSupportTicket(id, updates);

      if (res.success) {
        toast_notif("Ticket updated successfully", "success");
      } else {
        fetchTicket();
        toast_notif("Failed to update ticket", "error");
      }
    } catch (error) {
      fetchTicket();
      toast_notif("Network error", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="p-10 text-center text-slate-400">Loading Ticket...</div>
    );
  if (!ticket)
    return (
      <div className="p-10 text-center text-slate-400">Ticket Not Found</div>
    );

  return (
    <div className="p-8 max-w-[1200px] mx-auto min-h-screen">
      {/* 1. Header */}
      <TicketHeader
        ticket={ticket}
        onUpdateStatus={(s) => handleUpdate({ status: s })}
        onUpdatePriority={(p) => handleUpdate({ priority: p })}
        saving={saving}
      />

      {/* 2. Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Message & Conversation (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          <TicketMessage ticket={ticket} />
        </div>

        {/* Right Column: Context & Meta (1/3 width) */}
        <div className="space-y-6">
          <TicketInfoCard ticket={ticket} />
        </div>
      </div>
    </div>
  );
}
