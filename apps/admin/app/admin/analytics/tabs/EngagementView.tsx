"use client";

import { useState } from "react";
import { useEngagementMetrics } from "@omenai/shared-hooks/hooks/useMetrics";
import { AreaChart } from "@tremor/react";

import { EngagementSkeleton } from "../ui/Skeletons";
import { ErrorState, EmptyChart } from "../ui/Ui";
import { ArtworkLeaderboardItem } from "@omenai/shared-types";
import { getOptimizedImage } from "@omenai/shared-lib/storage/getImageFileView";

// ── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n: number) => new Intl.NumberFormat().format(n || 0);

// Custom Tooltip for the Trend Chart
const CustomAreaTip = ({ payload, active, label }: any) => {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="bg-white/80 backdrop-blur-md border border-neutral-100/50 rounded-xl shadow-lg shadow-neutral-200/20 px-4 py-3 min-w-[150px]">
      <p className="text-[10px] tracking-widest uppercase text-neutral-400 font-medium mb-3">
        {label}
      </p>
      <div className="space-y-2.5">
        {payload.map((item: any, idx: number) => (
          <div key={idx} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span
                className="w-1.5 h-1.5 rounded-full shrink-0 opacity-80"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-[11px] text-neutral-500 font-medium">
                {item.name}
              </span>
            </div>
            <span className="text-[11px] font-medium text-neutral-700 tabular-nums">
              {fmt(item.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Sub-Component: The Liquidity Funnel ──────────────────────────────────────
const LiquidityFunnel = ({ funnel }: { funnel: any }) => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100/60">
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-[10px] tracking-widest uppercase text-neutral-400 font-medium mb-1">
            Liquidity Pipeline
          </p>
          <h3 className="text-xs font-medium text-neutral-600">
            Price Request Conversion
          </h3>
        </div>
        <div className="text-right">
          <p className="text-[10px] tracking-widest uppercase text-neutral-400 font-medium mb-1">
            Total Efficiency
          </p>
          <p className="text-xl font-normal text-emerald-400 tabular-nums">
            {funnel.rates.totalLiquidity}%
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
        <div className="flex-1 bg-neutral-50/50 p-5 rounded-xl border border-neutral-50 relative">
          <p className="text-[10px] tracking-widest uppercase text-neutral-400 font-medium mb-1.5">
            Price Requests
          </p>
          <p className="text-2xl font-normal text-neutral-700 tabular-nums">
            {fmt(funnel.requests)}
          </p>
        </div>

        <div className="hidden md:flex flex-col items-center justify-center w-20 shrink-0">
          <p className="text-[9px] tracking-widest uppercase text-neutral-300 font-medium mb-1">
            Intent
          </p>
          <div className="flex items-center justify-center h-5 px-2.5 bg-white rounded-full shadow-sm border border-neutral-100 text-[10px] font-medium text-neutral-500 tabular-nums">
            {funnel.rates.requestToOrder}%
          </div>
        </div>

        <div className="flex-1 bg-blue-50/30 p-5 rounded-xl border border-blue-50 relative">
          <p className="text-[10px] tracking-widest uppercase text-blue-400 font-medium mb-1.5">
            Orders Placed
          </p>
          <p className="text-2xl font-normal text-blue-800 tabular-nums">
            {fmt(funnel.ordersPlaced)}
          </p>
        </div>

        <div className="hidden md:flex flex-col items-center justify-center w-20 shrink-0">
          <p className="text-[9px] tracking-widest uppercase text-neutral-300 font-medium mb-1">
            Closing
          </p>
          <div className="flex items-center justify-center h-5 px-2.5 bg-white rounded-full shadow-sm border border-neutral-100 text-[10px] font-medium text-neutral-500 tabular-nums">
            {funnel.rates.orderToPaid}%
          </div>
        </div>

        <div className="flex-1 bg-emerald-50/30 p-5 rounded-xl border border-emerald-50 relative">
          <p className="text-[10px] tracking-widest uppercase text-emerald-500 font-medium mb-1.5">
            Successfully Paid
          </p>
          <p className="text-2xl font-normal text-emerald-800 tabular-nums">
            {fmt(funnel.ordersPaid)}
          </p>
        </div>
      </div>
    </div>
  );
};

// ── Sub-Component: Artwork Leaderboard ───────────────────────────────────────
const LeaderboardList = ({
  title,
  subtitle,
  data,
  metricLabel,
  colorClass,
}: {
  title: string;
  subtitle: string;
  data: ArtworkLeaderboardItem[];
  metricLabel: string;
  colorClass: string;
}) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100/60 flex flex-col h-full">
    <div className="mb-6">
      <h3 className="text-xs font-medium text-neutral-600">{title}</h3>
      <p className="text-[11px] text-neutral-400 mt-1 font-normal">
        {subtitle}
      </p>
    </div>

    {data.length > 0 ? (
      <div className="flex-1 space-y-4">
        {data.map((item, idx) => (
          <div key={item._id} className="flex items-center gap-4 group">
            <span className="text-[11px] font-normal text-neutral-300 w-4 text-center shrink-0">
              {idx + 1}
            </span>
            <div className="w-10 h-10 rounded-lg overflow-hidden bg-neutral-50 shrink-0 border border-neutral-100/80">
              <img
                src={getOptimizedImage(item.url, "small", 90)}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90"
                loading="lazy"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-normal text-neutral-600 truncate">
                {item.title}
              </p>
              <p className="text-[10px] font-normal text-neutral-400 truncate mt-0.5">
                {item.artist}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className={`text-sm font-normal tabular-nums ${colorClass}`}>
                {fmt(item.count)}
              </p>
              <p className="text-[8px] tracking-widest uppercase text-neutral-300 mt-0.5">
                {metricLabel}
              </p>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div className="flex-1 flex items-center justify-center">
        <EmptyChart label={`No ${metricLabel.toLowerCase()} yet`} />
      </div>
    )}
  </div>
);

// ── Main Controller ──────────────────────────────────────────────────────────
export default function EngagementView() {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const { data, isLoading, isError } = useEngagementMetrics();

  if (isLoading) return <EngagementSkeleton />;

  if (isError || !data?.isOk || !data?.data)
    return <ErrorState message="Engagement data unavailable." />;

  const { summary, funnel, trends, leaderboards } = data.data;

  // ── Year Mapping Logic ──
  // Forces the chart to always render Jan -> Dec of the selected year
  const monthNames = [
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
  const shortYear = selectedYear.toString().slice(-2); // e.g., "25" or "26"

  const yearlyTrends = monthNames.map((month) => {
    // Looks for "Jan 26", "Feb 26" based on what the API currently returns
    const expectedDateStr = `${month} ${shortYear}`;
    const existingData = (trends ?? []).find(
      (t: any) => t.date === expectedDateStr,
    );

    return {
      date: month, // We only show the month name on the chart's X-axis now
      "Artwork Views": existingData?.["Artwork Views"] || 0,
      "Price Requests": existingData?.["Price Requests"] || 0,
    };
  });

  const hasTrends = yearlyTrends.some(
    (t) => t["Artwork Views"] > 0 || t["Price Requests"] > 0,
  );

  return (
    <div className="max-w-full mx-auto space-y-5">
      {/* ── Top Overview Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-neutral-100/60 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-300" />
              <p className="text-[10px] font-medium tracking-wider uppercase text-neutral-400">
                Platform Views
              </p>
            </div>
            <p className="text-2xl font-normal text-neutral-700 tabular-nums my-1">
              {fmt(summary.totalViews)}
            </p>
            <p className="text-[11px] font-normal text-neutral-400">
              Total artwork impressions across the platform
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-neutral-100/60 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-300" />
              <p className="text-[10px] font-medium tracking-wider uppercase text-neutral-400">
                Price Requests
              </p>
            </div>
            <p className="text-2xl font-normal text-neutral-700 tabular-nums my-1">
              {fmt(summary.totalRequests)}
            </p>
            <p className="text-[11px] font-normal text-neutral-400">
              Direct inquiries for hidden pricing
            </p>
          </div>
        </div>
      </div>

      {/* ── The Liquidity Pipeline ── */}
      <LiquidityFunnel funnel={funnel} />

      {/* ── 12-Month Trend Chart ── */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100/60 h-[400px] flex flex-col">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h3 className="text-xs font-medium text-neutral-600">
                Engagement Trends
              </h3>
              {/* Soft Year Toggle */}
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="text-[10px] font-medium text-neutral-500 bg-neutral-50 border border-neutral-200 rounded-md px-2 py-0.5 outline-none hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                {[currentYear, currentYear - 1, currentYear - 2].map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-[10px] tracking-widest uppercase text-neutral-400 font-medium">
              Monthly Velocity
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-300" />
              <span className="text-[9px] tracking-widest uppercase text-neutral-400 font-medium">
                Views
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-300" />
              <span className="text-[9px] tracking-widest uppercase text-neutral-400 font-medium">
                Requests
              </span>
            </div>
          </div>
        </div>

        <div className="flex-1 min-h-0 relative">
          {hasTrends ? (
            <div className="absolute inset-0">
              <AreaChart
                // Magic tailwind class removes the hard stroke line, leaving soft gradients
                className="h-full w-full [&_path.recharts-area-curve]:stroke-transparent text-xs"
                data={yearlyTrends}
                index="date"
                categories={["Artwork Views", "Price Requests"]}
                colors={["amber", "green"]}
                valueFormatter={fmt}
                showLegend={false}
                showGridLines={false}
                showYAxis={false}
                curveType="monotone"
                showAnimation
                animationDuration={1200}
                customTooltip={CustomAreaTip}
              />
            </div>
          ) : (
            <EmptyChart label={`No data recorded for ${selectedYear}`} />
          )}
        </div>
      </div>

      {/* ── Leaderboards Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <LeaderboardList
          title="Market Attention"
          subtitle="Top 5 most viewed artworks across the platform."
          data={leaderboards.topViewed}
          metricLabel="Views"
          colorClass="text-indigo-400"
        />
        <LeaderboardList
          title="Purchase Intent"
          subtitle="Top 5 artworks generating the most price requests."
          data={leaderboards.topRequested}
          metricLabel="Requests"
          colorClass="text-violet-400"
        />
      </div>

      {/* Tremor Safelist */}
      <div className="hidden bg-indigo-500 bg-violet-500 fill-indigo-500 fill-violet-500 text-indigo-500 text-violet-500 stroke-indigo-500 stroke-violet-500" />
    </div>
  );
}
