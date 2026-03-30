"use client";

import { useState } from "react";
import { useFinancialMetrics } from "@omenai/shared-hooks/hooks/useMetrics";
import { AreaChart, DonutChart, BarList } from "@tremor/react";

import { FinancialSkeleton } from "../ui/Skeletons";
import {
  ErrorState,
  ChartTooltip,
  DonutTooltip,
  MetricCard,
  SectionPanel,
  EmptyChart,
} from "../ui/Ui";

const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);

export default function FinancialView() {
  // 1. Interactive Year Toggle State
  const currentYear = new Date().getFullYear().toString();
  const [selectedYear, setSelectedYear] = useState(currentYear);

  // 2. Fetch Dynamic Data
  const { data, isLoading, isError } = useFinancialMetrics(selectedYear);

  if (isLoading) return <FinancialSkeleton />;
  if (isError || !data?.isOk || !data?.data)
    return <ErrorState message="Unable to load financial intelligence." />;

  const { kpis, trendChart, funnelChart, liabilitiesChart } = data.data;

  // --- NEW: 12-Month Continuous Timeline Builder ---
  // 1. Define the exact x-axis we want to see on the chart
  const allMonths = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  // 2. Helper to catch variations like "January", "JAN", or "Jan" from the DB
  const normalizeMonth = (m?: string) => {
    if (!m) return "";
    // Grabs the first 3 letters and title-cases them (e.g., "january" -> "Jan")
    return (
      m.substring(0, 3).charAt(0).toUpperCase() +
      m.substring(1, 3).toLowerCase()
    );
  };

  // 3. Build the perfect array: Map over our 12 months, fill with DB data if it exists, otherwise default to 0
  const completeTrendChart = allMonths.map((monthName) => {
    const foundData = (trendChart || []).find(
      (dbItem) => normalizeMonth(dbItem.month) === monthName,
    );

    return {
      month: monthName,
      gmv: foundData?.gmv || 0,
      netRevenue: foundData?.netRevenue || 0,
    };
  });
  // -------------------------------------------------

  // 3. Process Relative Data Comparisons
  const realizedGMV = kpis.realizedGMV || 0;

  // Extract Funnel Values safely with optional chaining (?.includes)
  const pendingRev =
    funnelChart.find((f) => f.name?.includes("Pending"))?.value || 0;
  const abandonedRev =
    funnelChart.find((f) => f.name?.includes("Sticker Shock"))?.value || 0;
  const ghostedRev =
    funnelChart.find((f) => f.name?.includes("Ghosted"))?.value || 0;

  const totalDemand = realizedGMV + abandonedRev + ghostedRev;

  // A. Win/Loss Ratio (Donut Chart)
  const captureVsLossData = [
    { name: "Realized (Captured)", amount: realizedGMV },
    { name: "Lost (Collector Abandoned)", amount: abandonedRev },
    { name: "Lost (Seller Ghosted)", amount: ghostedRev },
  ].filter((d) => d.amount > 0);

  // B. Pipeline Ratio (BarList)
  const pipelineData = [
    { name: "Secured Revenue (Cleared)", value: realizedGMV },
    { name: "Pending Revenue (In Escrow/Quotes)", value: pendingRev },
  ].filter((d) => d.value > 0);

  // Checks for empty states
  const hasTrendData = trendChart.some(
    (d) => (d.gmv || 0) > 0 || (d.netRevenue || 0) > 0,
  );
  const hasCaptureData = captureVsLossData.length > 0;

  // Tooltips
  const AreaTooltip = ({ payload, active, label }: any) => (
    <ChartTooltip
      active={active}
      payload={payload}
      label={label}
      formatter={(v) => fmt(v)}
    />
  );
  const DonutTip = ({ payload, active }: any) => (
    // The translate classes push the tooltip box away from the cursor
    // Adjust these values (e.g., -translate-y-16, translate-x-8) to push it exactly where you want it outside the ring
    <div className="pointer-events-none transform -translate-y-16 translate-x-8">
      <DonutTooltip active={active} payload={payload} formatter={fmt} />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* ── High-Level Pulse (KPIs) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Realized GMV"
          value={fmt(realizedGMV)}
          sub="Total cleared sales volume"
          delay={0}
        />
        <MetricCard
          label="Net Platform Revenue"
          value={fmt(kpis.netPlatformRevenue || 0)}
          sub="Omenai commission"
          delay={80}
        />
        <MetricCard
          label="True AOV"
          value={fmt(kpis.trueAOV || 0)}
          sub="Avg. per completed order"
          delay={160}
        />
        <MetricCard
          label="Pending Pipeline"
          value={fmt(pendingRev)}
          sub="Uncaptured live revenue"
          badge={
            pendingRev > 0 ? { text: "Active", variant: "amber" } : undefined
          }
          delay={240}
        />
      </div>

      {/* ── 2x2 Data Analysis Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Top-Left: Revenue Timeline */}
        {/* Top-Left: Revenue Timeline */}
        <SectionPanel
          title={`${selectedYear} Revenue Trend`}
          delay={320}
          className="h-[420px] flex flex-col"
          headerRight={
            <div className="flex items-center gap-4">
              {/* Legends (Hidden on very small screens to make room for the dropdown) */}
              <div className="hidden sm:flex items-center gap-4 mr-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-blue-500 rounded" />
                  <span className="text-[9px] tracking-wide uppercase text-[#B0B8C1]">
                    GMV
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-green-500 rounded" />
                  <span className="text-[9px] tracking-wide uppercase text-[#B0B8C1]">
                    Net Rev.
                  </span>
                </div>
              </div>

              {/* Year Toggle */}
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className={
                  "bg-white border border-neutral-200 text-xs rounded-md px-3 py-2 text-[#0E1B2E] shadow-sm focus:outline-none focus:ring-1 focus:ring-dark focus:border-none cursor-pointer"
                }
              >
                {[0, 1, 2].map((offset) => {
                  const y = (parseInt(currentYear) - offset).toString();
                  return (
                    <option key={y} value={y}>
                      {y} Fiscal Year
                    </option>
                  );
                })}
              </select>
            </div>
          }
        >
          <div className="flex-1 min-h-0 relative mt-4">
            {hasTrendData ? (
              <div className="absolute z-10 inset-0">
                <AreaChart
                  className="h-full w-full text-xs"
                  data={completeTrendChart}
                  index="month"
                  categories={["gmv", "netRevenue"]}
                  colors={["blue", "green"]}
                  valueFormatter={(n: number) => fmt(n)}
                  showLegend={false}
                  showGridLines={false}
                  showYAxis={false}
                  curveType="monotone"
                  showAnimation={true}
                  customTooltip={AreaTooltip}
                />
              </div>
            ) : (
              <EmptyChart label={`No revenue recorded in ${selectedYear}`} />
            )}
          </div>
        </SectionPanel>

        {/* Top-Right: Revenue Capture vs Loss (The Win/Loss Ratio) */}
        <SectionPanel
          title="Revenue Fate (Capture vs. Leakage)"
          delay={400}
          className="h-[420px] flex flex-col"
        >
          {hasCaptureData ? (
            <div className="flex-1 flex flex-col items-center justify-center pt-2">
              <div className="relative w-48 h-48 shrink-0 overflow-visible">
                <div className="absolute z-10 inset-0 overflow-visible">
                  <DonutChart
                    data={captureVsLossData}
                    category="amount"
                    index="name"
                    valueFormatter={fmt}
                    colors={["blue", "amber", "rose"]}
                    className="w-full h-full overflow-visible"
                    showLabel={false}
                    showAnimation={true}
                    customTooltip={DonutTip}
                  />
                </div>
                {/* Center label comparing demand */}
                <div className="absolute z-0 inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[9px] text-[#B0B8C1] tracking-[0.2em] uppercase text-center">
                    Total Demand
                  </span>
                  <span className="font-serif text-lg text-[#0E1B2E] mt-1">
                    {fmt(totalDemand)}
                  </span>
                </div>
              </div>

              {/* Dynamic Legend */}
              <div className="flex flex-col w-full px-6 mt-8 gap-3">
                {captureVsLossData.map((item, i) => {
                  const dotColors = [
                    "bg-blue-500",
                    "bg-amber-500",
                    "bg-rose-500",
                  ];
                  return (
                    <div
                      key={item.name}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${dotColors[i]}`}
                        />
                        <span className="text-[10px] tracking-[0.05em] uppercase text-[#8A96A3]">
                          {item.name}
                        </span>
                      </div>
                      <span className="font-serif text-xs text-[#0E1B2E]">
                        {fmt(item.amount)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <EmptyChart label="No demand data to compare" />
          )}
        </SectionPanel>

        {/* Bottom-Left: Active Pipeline Health (Donut Chart) */}
        <SectionPanel
          title="Pipeline Ratio (Secured vs. Pending)"
          delay={480}
          className="min-h-[300px] flex flex-col"
        >
          <p className="text-xs text-slate-400 mb-2">
            Compares money actively sitting in unresponsed orders against fully
            cleared revenue.
          </p>

          <div className="flex-1 flex flex-col items-center justify-center pt-4">
            <div className="relative w-40 h-40 shrink-0 overflow-visible">
              <DonutChart
                data={[
                  { name: "Secured Revenue (Cleared)", value: realizedGMV },
                  {
                    name: "Pending Revenue (In Escrow/Quotes)",
                    value: pendingRev,
                  },
                ]}
                category="value"
                index="name"
                valueFormatter={fmt}
                colors={["green", "blue"]}
                className="w-full h-full overflow-visible"
                showLabel={false}
                showAnimation={true}
                customTooltip={DonutTip}
              />
            </div>

            {/* Dynamic Legend */}
            <div className="flex flex-col w-full px-2 mt-6 gap-3">
              {[
                { name: "Secured Revenue (Cleared)", value: realizedGMV },
                {
                  name: "Pending Revenue (Orders not reviewed)",
                  value: pendingRev,
                },
              ].map((item, i) => {
                const dotColors = ["bg-green-500", "bg-blue-500"];
                return (
                  <div
                    key={item.name}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${dotColors[i]}`}
                      />
                      <span className="text-[10px] tracking-[0.05em] uppercase text-[#8A96A3]">
                        {item.name}
                      </span>
                    </div>
                    <span className="font-serif text-xs text-[#0E1B2E]">
                      {fmt(item.value)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </SectionPanel>

        {/* Bottom-Right: Liabilities & Operational Costs (Donut Chart) */}
        <SectionPanel
          title="Logistics & Liabilities"
          delay={560}
          className="min-h-[300px] flex flex-col"
        >
          <p className="text-xs text-slate-400 mb-2">
            Pass-through funds and operational friction averages.
          </p>
          {liabilitiesChart && liabilitiesChart.length > 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center pt-4">
              <div className="relative w-40 h-40 shrink-0 overflow-visible">
                <DonutChart
                  data={liabilitiesChart}
                  category="value"
                  index="name"
                  valueFormatter={fmt}
                  colors={["violet", "amber"]}
                  className="w-full h-full overflow-visible"
                  showLabel={false}
                  showAnimation={true}
                  customTooltip={DonutTip}
                />
              </div>

              {/* Dynamic Legend */}
              <div className="flex flex-col w-full px-2 mt-6 gap-3">
                {liabilitiesChart.map((item, i) => {
                  const dotColors = ["bg-violet-500", "bg-amber-400"];
                  return (
                    <div
                      key={item.name}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${dotColors[i]}`}
                        />
                        <span className="text-[10px] tracking-[0.05em] uppercase text-[#8A96A3]">
                          {item.name}
                        </span>
                      </div>
                      <span className="font-serif text-xs text-[#0E1B2E]">
                        {fmt(item.value as number)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <EmptyChart label="No liability data recorded" />
          )}
        </SectionPanel>
      </div>

      {/* Tremor color safelist (crucial for dynamic classes) */}
      <div className="hidden bg-blue-500 bg-amber-500 bg-rose-500 bg-green-500 bg-indigo-500 bg-slate-500 text-amber-500 text-blue-500 text-green-500 fill-blue-500 fill-green-500 fill-amber-500 fill-rose-500 fill-indigo-500 fill-slate-500" />
    </div>
  );
}
