"use client";

import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { getApiUrl } from "@omenai/url-config/src/config";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";

// Skeleton Component for individual items
const PickupSkeleton = () => (
  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm animate-pulse">
    <div className="flex flex-col lg:flex-row justify-between gap-4">
      <div className="space-y-4 flex-1">
        <div className="flex items-center gap-3">
          <div className="h-6 w-20 bg-slate-200 rounded" />
          <div className="h-6 w-12 bg-slate-200 rounded" />
          <div className="h-4 w-32 bg-slate-100 rounded" />
        </div>
        <div className="h-12 w-full bg-slate-100 rounded-md" />
        <div className="grid grid-cols-2 gap-4 mt-2">
          <div className="space-y-2">
            <div className="h-3 w-20 bg-slate-100 rounded" />
            <div className="h-4 w-24 bg-slate-200 rounded" />
          </div>
          <div className="space-y-2">
            <div className="h-3 w-16 bg-slate-100 rounded" />
            <div className="h-4 w-28 bg-slate-200 rounded" />
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-2 justify-center lg:w-48 border-t lg:border-t-0 lg:border-l pt-4 lg:pt-0 lg:pl-6">
        <div className="h-9 w-full bg-slate-200 rounded-lg" />
        <div className="h-9 w-full bg-slate-100 rounded-lg" />
      </div>
    </div>
  </div>
);

// Types based on your Schema
type FailedPickup = {
  _id: string;
  order_id: string;
  carrier: "UPS" | "DHL";
  error_message: string;
  status: "pending" | "resolved" | "manual_intervention_required";
  retry_count: number;
  created_at: string;
  payload_snapshot: {
    data: {
      seller_details: { fullname: string; address: any };
      receiver_address: any;
    };
  };
};

export default function PickupManager() {
  const [activeTab, setActiveTab] = useState<"pending" | "resolved">("pending");
  const [pickups, setPickups] = useState<FailedPickup[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const { user, csrf } = useAuth({ requiredRole: "admin" });
  // Fetch Data
  const fetchPickups = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${getApiUrl()}/api/admin/pickup/list?status=${activeTab}`,
      );
      const data = await res.json();
      if (data.success) {
        setPickups(data.data);
      }
    } catch (error) {
      toast.error("Failed to load pickups");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPickups();
  }, [activeTab]);

  // Action: Retry Auto-Schedule
  const handleRetry = async (order_id: string) => {
    setProcessingId(order_id);
    try {
      const res = await fetch(`${getApiUrl()}/api/admin/pickup/retry`, {
        method: "POST",
        body: JSON.stringify({ order_id }),
        headers: { "x-csrf-token": csrf || "" },
        credentials: "include",
      });
      const result = await res.json();

      if (result.success) {
        toast.success("Pickup scheduled successfully!");
        fetchPickups(); // Refresh list
      } else {
        toast.error(`Retry Failed: ${result.error}`);
        // Optional: Refresh to show updated error message/retry count
        fetchPickups();
      }
    } catch (err) {
      toast.error("Network error during retry");
    } finally {
      setProcessingId(null);
    }
  };

  // Action: Manual Resolve
  const handleManualResolve = async (order_id: string) => {
    if (!confirm("Are you sure you manually scheduled this pickup?")) return;

    setProcessingId(order_id);
    try {
      await fetch("/api/admin/pickup/resolve_manual", {
        method: "POST",
        body: JSON.stringify({ order_id }),
        headers: { "x-csrf-token": csrf || "" },
        credentials: "include",
      });
      toast.success("Marked as resolved");
      fetchPickups();
    } catch (err) {
      toast.error("Failed to update status");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="p-6 max-w-full mx-auto space-y-6">
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Pickup Exceptions
          </h1>
          <p className="text-sm text-slate-500">
            Manage failed courier pickup requests
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="bg-slate-100 p-1 rounded-lg flex space-x-1">
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === "pending"
                ? "bg-white text-red-600 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Action Required ({activeTab === "pending" ? pickups.length : ""})
          </button>
          <button
            onClick={() => setActiveTab("resolved")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === "resolved"
                ? "bg-white text-green-600 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Resolved History
          </button>
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4">
          {[...Array(3)].map((_, i) => (
            <PickupSkeleton key={i} />
          ))}
        </div>
      ) : pickups.length === 0 ? (
        <div className="py-20 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300">
          <p className="text-slate-500">No {activeTab} pickups found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {pickups.map((pickup) => (
            <div
              key={pickup._id}
              className={`bg-white border rounded-xl p-5 shadow-sm transition-all hover:shadow-md ${
                activeTab === "pending"
                  ? "border-l-4 border-l-red-500"
                  : "border-l-4 border-l-green-500"
              }`}
            >
              <div className="flex flex-col lg:flex-row justify-between gap-4">
                {/* Left: Key Info */}
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold bg-slate-100 px-2 py-1 rounded text-slate-600">
                      {pickup.order_id}
                    </span>
                    <span
                      className={`text-xs font-bold px-2 py-1 rounded ${
                        pickup.carrier === "UPS"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {pickup.carrier}
                    </span>
                    <span className="text-xs text-slate-400">
                      {format(
                        new Date(pickup.created_at),
                        "MMM d, yyyy • h:mm a",
                      )}
                    </span>
                  </div>

                  {/* The Error - Making it prominent */}
                  <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm font-medium border border-red-100 flex items-start gap-2">
                    <svg
                      className="w-5 h-5 text-red-500 shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>{pickup.error_message}</span>
                  </div>

                  {/* Context Data */}
                  <div className="grid grid-cols-2 gap-4 text-sm mt-2">
                    <div>
                      <span className="text-slate-500 block text-xs">
                        Pickup Location
                      </span>
                      <span className="text-slate-800 font-medium">
                        {
                          pickup.payload_snapshot?.data?.seller_details?.address
                            ?.city
                        }
                        ,{" "}
                        {
                          pickup.payload_snapshot?.data?.seller_details?.address
                            ?.stateCode
                        }
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-xs">
                        Attempts
                      </span>
                      <span className="text-slate-800">
                        {pickup.retry_count} / 3 auto-retries
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                {activeTab === "pending" && (
                  <div className="flex flex-col gap-2 justify-center lg:w-48 border-t lg:border-t-0 lg:border-l pt-4 lg:pt-0 lg:pl-6">
                    <button
                      onClick={() => handleRetry(pickup.order_id)}
                      disabled={!!processingId}
                      className="w-full py-2 px-4 bg-black text-white text-sm font-medium rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {processingId === pickup.order_id ? (
                        <span className="animate-pulse">Retrying...</span>
                      ) : (
                        <>
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                            />
                          </svg>
                          Retry Auto
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleManualResolve(pickup.order_id)}
                      disabled={!!processingId}
                      className="w-full py-2 px-4 bg-white border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50"
                    >
                      Mark Resolved
                    </button>
                    <p className="text-[10px] text-slate-400 text-center mt-1">
                      Use "Mark Resolved" if you scheduled it via phone.
                    </p>
                  </div>
                )}

                {/* Resolved State Visual */}
                {activeTab === "resolved" && (
                  <div className="flex items-center justify-center lg:w-48 border-t lg:border-t-0 lg:border-l pt-4 lg:pt-0">
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-green-100 text-green-600 mb-2">
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                      <p className="text-sm font-medium text-slate-900">
                        Resolved
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
