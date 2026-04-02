"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Mail, ChevronLeft, ChevronRight, Users } from "lucide-react";
import { fetchCollectors } from "@omenai/shared-services/admin/fetch_collectors";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";

interface Collector {
  user_id: string;
  name: string;
  email: string;
}

interface PaginatedResponse {
  isOk: boolean;
  message: string;
  data: Collector[];
  total: number;
  pages: number;
  page: number;
  limit: number;
}

// --- Helper Functions ---
const getInitials = (name: string) => {
  if (!name) return "??";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

export default function CollectorsPage() {
  const [page, setPage] = useState(1);
  const { csrf } = useAuth({ requiredRole: "admin" });
  const limit = 16;

  const { data, isLoading, isError, isFetching } = useQuery<PaginatedResponse>({
    queryKey: ["collectors", page, limit],
    queryFn: async () => {
      const result = await fetchCollectors(page, limit, csrf || "");

      if (!result.isOk) {
        throw new Error(result.message || "Failed to fetch collectors");
      }
      return result as PaginatedResponse;
    },
  });

  return (
    <div className="min-h-screen bg-slate-50/50 p-4">
      <div className="mx-auto max-w-full">
        {/* Page Header */}
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Collectors
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage and reach out to your network of art collectors.
            </p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm">
            <Users className="h-5 w-5 text-slate-400" />
          </div>
        </header>

        {/* Content Area */}
        {/* Now checks both isLoading (first load) and isFetching (pagination) */}
        {isLoading || isFetching ? (
          <GridSkeleton limit={limit} />
        ) : isError ? (
          <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-red-200 bg-red-50 text-red-600">
            <p className="font-medium">Failed to load collectors.</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 text-sm text-red-500 hover:underline"
            >
              Try again
            </button>
          </div>
        ) : data?.data.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white">
            <Users className="mb-3 h-8 w-8 text-slate-300" />
            <p className="text-sm font-medium text-slate-900">
              No collectors found
            </p>
            <p className="text-sm text-slate-500">
              Your directory is currently empty.
            </p>
          </div>
        ) : (
          <>
            {/* Cards Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {data?.data.map((collector) => (
                <div
                  key={collector.user_id}
                  className="group relative flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 transition-all duration-200 hover:border-slate-300 hover:shadow-md hover:shadow-slate-200/50"
                >
                  <div className="flex items-center gap-4 overflow-hidden">
                    {/* Avatar */}
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-medium tracking-wide text-slate-700">
                      {getInitials(collector.name)}
                    </div>

                    {/* Info */}
                    <div className="flex min-w-0 flex-col">
                      <p className="truncate text-sm font-medium text-slate-900">
                        {collector.name}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {collector.email}
                      </p>
                    </div>
                  </div>

                  {/* Mail Action Button */}
                  <a
                    href={`mailto:${collector.email}`}
                    className="ml-4 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-dark hover:text-white focus:outline-none focus:ring-2 focus:ring-dark/20"
                    title={`Send email to ${collector.name}`}
                  >
                    <Mail className="h-4 w-4" />
                  </a>
                </div>
              ))}
            </div>

            {/* Pagination Footer */}
            <div className="mt-8 flex items-center justify-between border-t border-slate-200 pt-6">
              <p className="text-sm text-slate-500">
                Showing page{" "}
                <span className="font-medium text-slate-900">{page}</span> of{" "}
                <span className="font-medium text-slate-900">
                  {data?.pages || 1}
                </span>
                <span className="ml-2 hidden sm:inline-block">
                  ({data?.total || 0} total collectors)
                </span>
              </p>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((old) => Math.max(old - 1, 1))}
                  disabled={page === 1}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setPage((old) => old + 1)}
                  disabled={!data?.pages || page >= data.pages}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-50"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// --- Loading Skeleton Component ---
function GridSkeleton({ limit }: { limit: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: limit }).map((_, i) => (
        <div
          key={i}
          className="flex animate-pulse items-center justify-between rounded-2xl border border-slate-100 bg-white p-4"
        >
          <div className="flex w-full items-center gap-4">
            <div className="h-11 w-11 shrink-0 rounded-full bg-slate-200" />
            <div className="flex flex-1 flex-col gap-2">
              <div className="h-4 w-24 rounded bg-slate-200" />
              <div className="h-3 w-32 rounded bg-slate-100" />
            </div>
          </div>
          <div className="h-8 w-8 shrink-0 rounded-full bg-slate-100" />
        </div>
      ))}
    </div>
  );
}
