"use client";
import React, { useState } from "react";
import { ResponsivePie } from "@nivo/pie";
import { formatDistanceToNow } from "date-fns";

// Hooks
import { useDashboardAnalytics } from "@omenai/shared-hooks/hooks/useDashboardAnalytics";
import { useUserOperations } from "@omenai/shared-hooks/hooks/useUserOperations";

// Analytics Components
import { DenseBarChart } from "./components/charts/DenseChartBar";
import { StrategyFeed } from "./components/StrategyFeed";
import { MetricCards } from "./components/MetricCards";
import { RoiBarChart } from "./components/charts/RoiBarChart";
import { FilterSidebar } from "./crm/components/FilterSideBar";
import { UserTable } from "./crm/components/UserTable";

// CRM Components

export default function EnterpriseDashboard() {
  // ---------------------------------------------------------------------------
  // 1. VIEW STATE MANAGEMENT
  // ---------------------------------------------------------------------------
  const [viewMode, setViewMode] = useState<"analytics" | "crm">("analytics");
  const [crmTab, setCrmTab] = useState<"artist" | "collector">("collector");

  // ---------------------------------------------------------------------------
  // 2. DATA HOOKS (Conditional Loading)
  // ---------------------------------------------------------------------------

  // Analytics Data (Always fetched or cached)
  const {
    data: analyticsData,
    isLoading: analyticsLoading,
    isError: analyticsError,
    refetch: refetchAnalytics,
  } = useDashboardAnalytics();

  const stats = analyticsData?.stats;
  const suggestions = analyticsData?.suggestions || [];

  // CRM Data (Only active when viewMode is 'crm')
  // We pass the active tab ('artist' or 'collector') to fetch the right users
  const crm = useUserOperations(crmTab);
  console.log(crm.facets);

  // ---------------------------------------------------------------------------
  // 3. LOADING & ERROR STATES (Analytics View Only)
  // ---------------------------------------------------------------------------
  if (viewMode === "analytics") {
    if (analyticsLoading)
      return (
        <div className="min-h-screen bg-slate-50 animate-pulse flex items-center justify-center text-slate-400">
          Loading Intelligence...
        </div>
      );
    if (analyticsError || !stats)
      return (
        <div className="p-10 text-red-500">
          System Error.{" "}
          <button onClick={() => refetchAnalytics()} className="underline">
            Retry
          </button>
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      {/* ======================================================================
          TOP NAVIGATION BAR (Sticky Header)
      ====================================================================== */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-6">
          {/* View Toggle Switch */}
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setViewMode("analytics")}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                viewMode === "analytics"
                  ? "bg-white shadow-sm text-slate-900"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Mission Control
            </button>
            <button
              onClick={() => setViewMode("crm")}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                viewMode === "crm"
                  ? "bg-white shadow-sm text-slate-900"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              User Operations
            </button>
          </div>
        </div>

        {/* CRM Actions (Only visible in CRM Mode) */}
        {viewMode === "crm" && (
          <div className="flex items-center gap-4">
            <span className="text-xs font-medium text-slate-500">
              {crm.selectedIds.length} users selected
            </span>
            <button
              disabled={crm.selectedIds.length === 0 || crm.isInviting}
              onClick={crm.inviteUsers}
              className={`px-4 py-2 rounded-lg text-sm font-bold text-white transition-colors shadow-sm ${
                crm.selectedIds.length > 0
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-slate-300 cursor-not-allowed"
              }`}
            >
              {crm.isInviting ? "Sending..." : "Invite Selected"}
            </button>
          </div>
        )}

        {/* Analytics Status (Only visible in Analytics Mode) */}
        {viewMode === "analytics" && (
          <div className="text-xs font-mono text-slate-400">
            System Status: <span className="text-green-500">● Live</span>
          </div>
        )}
      </div>

      {/* ======================================================================
          VIEW 1: ANALYTICS DASHBOARD
      ====================================================================== */}
      {viewMode === "analytics" ? (
        <div className="p-6 md:p-8">
          {/* Header Stats */}
          <div className="mb-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                Waitlist Intelligence
              </h2>
              <p className="text-sm text-slate-500">
                {stats.overview.leads} Leads Captured • {stats.overview.visits}{" "}
                Visits
              </p>
            </div>
            <MetricCards overview={stats.overview} />
          </div>

          {/* Strategy Feed */}
          {suggestions.length > 0 && (
            <div className="mb-8">
              <StrategyFeed suggestions={suggestions} />
            </div>
          )}

          {/* Bento Grid Visuals */}
          <div className="grid grid-cols-12 gap-6">
            {/* ROW A: Ecosystem & Geo */}
            <div className="col-span-12 md:col-span-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm h-80">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-4">
                Ecosystem Balance
              </h3>
              <div className="h-60">
                <ResponsivePie
                  data={stats.split.map((d: any) => ({
                    id: d._id,
                    value: d.count,
                  }))}
                  margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                  innerRadius={0.6}
                  padAngle={1}
                  cornerRadius={4}
                  colors={{ scheme: "set2" }}
                  activeOuterRadiusOffset={8}
                  enableArcLinkLabels={false}
                />
              </div>
            </div>

            <div className="col-span-12 md:col-span-8 bg-white p-5 rounded-xl border border-slate-200 shadow-sm h-80">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-4">
                Global Heatmap
              </h3>
              <div className="h-60">
                <DenseBarChart data={stats.geo} colorScheme="nivo" />
              </div>
            </div>

            {/* ROW B: Collector Intelligence */}
            <div className="col-span-12 md:col-span-6 bg-white p-5 rounded-xl border-l-4 border-amber-400 shadow-sm h-96">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-800">
                  💰 Collector DNA
                </h3>
                <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">
                  High Priority
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 h-64">
                <div className="h-full">
                  <p className="text-xs font-medium text-slate-400 mb-2">
                    Buying Frequency
                  </p>
                  <DenseBarChart
                    data={stats.collectors.frequency}
                    colorScheme="spectral"
                  />
                </div>
                <div className="h-full">
                  <p className="text-xs font-medium text-slate-400 mb-2">
                    Collector Type
                  </p>
                  <DenseBarChart
                    data={stats.collectors.type}
                    colorScheme="pastel1"
                  />
                </div>
              </div>
            </div>

            {/* ROW C: Artist Intelligence */}
            <div className="col-span-12 md:col-span-6 bg-white p-5 rounded-xl border-l-4 border-blue-400 shadow-sm h-96">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-800">
                  🎨 Artist Pedigree
                </h3>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  Supply Side
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 h-64">
                <div className="h-full">
                  <p className="text-xs font-medium text-slate-400 mb-2">
                    Formal Education
                  </p>
                  <DenseBarChart
                    data={stats.artists.education}
                    colorScheme="set1"
                  />
                </div>
                <div className="h-full">
                  <p className="text-xs font-medium text-slate-400 mb-2">
                    Years of Practice
                  </p>
                  <DenseBarChart
                    data={stats.artists.experience}
                    colorScheme="category10"
                  />
                </div>
              </div>
            </div>

            {/* ROW D: ROI & Live Feed */}
            <div className="col-span-12 md:col-span-8 bg-white p-5 rounded-xl border border-slate-200 shadow-sm h-[26rem]">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-4">
                Traffic Acquisition (ROI)
              </h3>
              <div className="h-80">
                <RoiBarChart data={stats.traffic} />
              </div>
            </div>

            <div className="col-span-12 md:col-span-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm h-[26rem] overflow-hidden">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-4">
                Recent Signups
              </h3>
              <div className="space-y-4 overflow-y-auto h-full pb-8">
                {stats.recent.map((user: any, i: number) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100"
                  >
                    <div>
                      <p className="text-sm font-bold text-slate-800 capitalize">
                        {user.entity}
                      </p>
                      <p className="text-xs text-slate-500">{user.country}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono text-slate-400">
                        {user.marketing?.source || "Direct"}
                      </span>
                      <p className="text-[10px] text-slate-400 mt-1">
                        {formatDistanceToNow(new Date(user.createdAt))} ago
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ======================================================================
            VIEW 2: CRM / USER OPERATIONS
        ====================================================================== */
        <div className="flex h-[calc(100vh-73px)] overflow-hidden bg-slate-50">
          {/* Sidebar Filter Panel */}
          <FilterSidebar
            activeTab={crmTab}
            filters={crm.filters}
            setFilters={crm.setFilters}
            facets={crm.facets} // 👈 Pass the dynamic data here
          />

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col h-full min-w-0">
            {/* Entity Tabs */}
            <div className="px-8 pt-6 pb-0 border-b border-slate-200 bg-white shadow-sm z-10">
              <div className="flex gap-8">
                <button
                  onClick={() => setCrmTab("collector")}
                  className={`pb-3 text-sm font-bold border-b-2 transition-colors ${
                    crmTab === "collector"
                      ? "border-amber-400 text-slate-900"
                      : "border-transparent text-slate-400 hover:text-slate-600"
                  }`}
                >
                  Collector Pool
                </button>
                <button
                  onClick={() => setCrmTab("artist")}
                  className={`pb-3 text-sm font-bold border-b-2 transition-colors ${
                    crmTab === "artist"
                      ? "border-blue-400 text-slate-900"
                      : "border-transparent text-slate-400 hover:text-slate-600"
                  }`}
                >
                  Artist Pool
                </button>
              </div>
            </div>

            {/* User Data Table */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 min-h-[400px]">
                {crm.isLoading ? (
                  <div className="flex h-full items-center justify-center text-slate-400 py-20">
                    Loading User Data...
                  </div>
                ) : (
                  <UserTable
                    users={crm.users}
                    selectedIds={crm.selectedIds}
                    toggleSelection={crm.toggleSelection}
                    toggleAll={crm.toggleAll}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
