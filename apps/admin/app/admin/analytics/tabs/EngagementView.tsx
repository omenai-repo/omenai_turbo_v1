"use client";

import { useState, useMemo } from "react";
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
    <div className="bg-white/90 backdrop-blur-md border border-neutral-200/60 rounded-xl shadow-lg shadow-neutral-200/30 px-4 py-3 min-w-[150px]">
      <p className="text-[10px] tracking-widest uppercase text-neutral-500 font-normal mb-3">
        {label}
      </p>
      <div className="space-y-2.5">
        {payload.map((item: any, idx: number) => (
          <div key={idx} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span
                className="w-1.5 h-1.5 rounded-full shrink-0 opacity-90"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-[11px] text-neutral-600 font-normal">
                {item.name}
              </span>
            </div>
            <span className="text-[11px] font-medium text-neutral-800 tabular-nums">
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
          <p className="text-[10px] tracking-widest uppercase text-neutral-500 font-normal mb-1">
            Liquidity Pipeline
          </p>
          <h3 className="text-sm font-normal text-neutral-800">
            Price Request Conversion
          </h3>
        </div>
        <div className="text-right">
          <p className="text-[10px] tracking-widest uppercase text-neutral-500 font-normal mb-1">
            Total Efficiency
          </p>
          <p className="text-xl font-normal text-emerald-500 tabular-nums">
            {funnel.rates.totalLiquidity}%
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
        <div className="flex-1 bg-neutral-50/80 p-5 rounded-xl border border-neutral-100 relative">
          <p className="text-[10px] tracking-widest uppercase text-neutral-500 font-normal mb-1.5">
            Price Requests
          </p>
          <p className="text-2xl font-normal text-neutral-800 tabular-nums">
            {fmt(funnel.requests)}
          </p>
        </div>

        <div className="hidden md:flex flex-col items-center justify-center w-20 shrink-0">
          <p className="text-[9px] tracking-widest uppercase text-neutral-400 font-normal mb-1">
            Intent
          </p>
          <div className="flex items-center justify-center h-5 px-2.5 bg-white rounded-full shadow-sm border border-neutral-200 text-[10px] font-medium text-neutral-600 tabular-nums">
            {funnel.rates.requestToOrder}%
          </div>
        </div>

        <div className="flex-1 bg-blue-50/50 p-5 rounded-xl border border-blue-100 relative">
          <p className="text-[10px] tracking-widest uppercase text-blue-600 font-normal mb-1.5">
            Orders Placed
          </p>
          <p className="text-2xl font-normal text-blue-900 tabular-nums">
            {fmt(funnel.ordersPlaced)}
          </p>
        </div>

        <div className="hidden md:flex flex-col items-center justify-center w-20 shrink-0">
          <p className="text-[9px] tracking-widest uppercase text-neutral-400 font-normal mb-1">
            Closing
          </p>
          <div className="flex items-center justify-center h-5 px-2.5 bg-white rounded-full shadow-sm border border-neutral-200 text-[10px] font-medium text-neutral-600 tabular-nums">
            {funnel.rates.orderToPaid}%
          </div>
        </div>

        <div className="flex-1 bg-emerald-50/50 p-5 rounded-xl border border-emerald-100 relative">
          <p className="text-[10px] tracking-widest uppercase text-emerald-600 font-normal mb-1.5">
            Successfully Paid
          </p>
          <p className="text-2xl font-normal text-emerald-900 tabular-nums">
            {fmt(funnel.ordersPaid)}
          </p>
        </div>
      </div>
    </div>
  );
};

// ── Sub-Component: Unique Collector Tracker ──────────────────────────────────
const UniqueCollectorTracker = ({
  data,
  selectedYear,
}: {
  data: any[];
  selectedYear: number;
}) => {
  const yearlyTotal = data.reduce(
    (acc, curr) => acc + curr["Unique Collectors"],
    0,
  );
  const hasData = yearlyTotal > 0;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100/60 flex flex-col lg:flex-row gap-8 items-stretch">
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-[10px] tracking-widest uppercase text-neutral-500 font-normal mb-1">
              Active Buyer Base
            </p>
            <h3 className="text-sm font-normal text-neutral-800">
              Unique Collectors (POR)
            </h3>
          </div>
        </div>
        <div className="flex-1 min-h-[200px] relative">
          {hasData ? (
            <div className="absolute inset-0">
              <AreaChart
                className="h-full w-full [&_path.recharts-area-curve]:stroke-transparent text-xs font-normal text-neutral-500"
                data={data}
                index="date"
                categories={["Unique Collectors"]}
                colors={["cyan"]}
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
            <EmptyChart
              label={`No unique collectors recorded in ${selectedYear}`}
            />
          )}
        </div>
      </div>

      <div className="w-full lg:w-48 shrink-0 flex flex-col justify-center bg-cyan-50/50 p-5 rounded-xl border border-cyan-100">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
          <p className="text-[10px] tracking-widest uppercase text-neutral-500 font-normal">
            {selectedYear} Total
          </p>
        </div>
        <p className="text-2xl font-normal text-cyan-800 tabular-nums">
          {fmt(yearlyTotal)}
        </p>
        <p className="text-[11px] text-neutral-500 mt-2 font-normal leading-relaxed">
          Total distinct users who initiated a price request.
        </p>
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
      <h3 className="text-sm font-normal text-neutral-800">{title}</h3>
      <p className="text-xs text-neutral-500 mt-1 font-normal">{subtitle}</p>
    </div>

    {data.length > 0 ? (
      <div className="flex-1 space-y-4">
        {data.map((item, idx) => (
          <div key={item._id} className="flex items-center gap-4 group">
            <span className="text-xs font-normal text-neutral-400 w-4 text-center shrink-0">
              {idx + 1}
            </span>
            <div className="w-10 h-10 rounded-lg overflow-hidden bg-neutral-100 shrink-0 border border-neutral-200/80">
              <img
                src={getOptimizedImage(item.url, "small", 90)}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-95"
                loading="lazy"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-normal text-neutral-800 truncate">
                {item.title}
              </p>
              <p className="text-xs font-normal text-neutral-500 truncate mt-0.5">
                {item.artist}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className={`text-base font-normal tabular-nums ${colorClass}`}>
                {fmt(item.count)}
              </p>
              <p className="text-[9px] tracking-widest uppercase text-neutral-400 mt-0.5 font-normal">
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

  // Safely extract trends early to satisfy Rules of Hooks for useMemo
  const trends = data?.data?.trends ?? [];

  // ── Year Mapping Logic ──
  const yearlyData = useMemo(() => {
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

    return monthNames.map((month, index) => {
      const monthNumber = index + 1;
      const found = trends.find(
        (t: any) => t.year === selectedYear && t.month === monthNumber,
      );

      return {
        date: month,
        "Artwork Views": found?.views || 0,
        "Price Requests": found?.requests || 0,
        "Unique Collectors": found?.uniqueCollectors || 0,
      };
    });
  }, [trends, selectedYear]);

  if (isLoading) return <EngagementSkeleton />;

  if (isError || !data?.isOk || !data?.data)
    return <ErrorState message="Engagement data unavailable." />;

  const { summary, funnel, leaderboards } = data.data;

  const hasGeneralTrends = yearlyData.some(
    (t) => t["Artwork Views"] > 0 || t["Price Requests"] > 0,
  );

  return (
    <div className="max-w-full mx-auto space-y-5">
      {/* ── Top Overview Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100/60 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
              <p className="text-[10px] font-medium tracking-widest uppercase text-neutral-500">
                Platform Views
              </p>
            </div>
            <p className="text-2xl font-normal text-neutral-800 tabular-nums my-1">
              {fmt(summary.totalViews)}
            </p>
            <p className="text-[11px] font-normal text-neutral-500">
              Total artwork impressions across the platform
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100/60 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
              <p className="text-[10px] font-medium tracking-widest uppercase text-neutral-500">
                Price Requests
              </p>
            </div>
            <p className="text-2xl font-normal text-neutral-800 tabular-nums my-1">
              {fmt(summary.totalRequests)}
            </p>
            <p className="text-[11px] font-normal text-neutral-500">
              Direct inquiries for hidden pricing
            </p>
          </div>
        </div>
      </div>

      {/* ── The Liquidity Pipeline ── */}
      <LiquidityFunnel funnel={funnel} />

      {/* ── Global Year Toggle ── */}
      <div className="flex justify-end pt-2 pb-1">
        <div className="flex items-center gap-3 bg-white px-3 py-1.5 rounded-xl shadow-sm border border-neutral-200/60">
          <span className="text-[10px] tracking-widest uppercase text-neutral-500 font-normal">
            Select Year:
          </span>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="text-xs font-medium text-neutral-700 bg-neutral-50 border border-neutral-200 rounded-md px-2 py-1 outline-none hover:bg-neutral-100 transition-colors cursor-pointer"
          >
            {[currentYear, currentYear - 1, currentYear - 2].map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Unique Collectors Tracker ── */}
      <UniqueCollectorTracker data={yearlyData} selectedYear={selectedYear} />

      {/* ── 12-Month Trend Chart ── */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100/60 h-[400px] flex flex-col">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-[10px] tracking-widest uppercase text-neutral-500 font-normal mb-1">
              Monthly Velocity
            </p>
            <h3 className="text-sm font-normal text-neutral-800">
              Engagement Trends
            </h3>
          </div>
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span className="text-[10px] tracking-widest uppercase text-neutral-500 font-normal">
                Views
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              <span className="text-[10px] tracking-widest uppercase text-neutral-500 font-normal">
                Requests
              </span>
            </div>
          </div>
        </div>

        <div className="flex-1 min-h-0 relative">
          {hasGeneralTrends ? (
            <div className="absolute inset-0">
              <AreaChart
                className="h-full w-full [&_path.recharts-area-curve]:stroke-transparent text-xs font-normal text-neutral-500"
                data={yearlyData}
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
          colorClass="text-indigo-500"
        />
        <LeaderboardList
          title="Purchase Intent"
          subtitle="Top 5 artworks generating the most price requests."
          data={leaderboards.topRequested}
          metricLabel="Requests"
          colorClass="text-violet-500"
        />
      </div>

      {/* Tremor Safelist */}
      <div className="hidden bg-indigo-400 bg-violet-400 bg-indigo-500 bg-violet-500 bg-cyan-400 bg-cyan-500 bg-amber-400 bg-green-500 fill-indigo-500 fill-violet-500 fill-cyan-500 fill-amber-500 fill-green-500 text-indigo-500 text-violet-500 text-cyan-500 text-amber-500 text-green-500 stroke-indigo-500 stroke-violet-500 stroke-cyan-500 stroke-amber-500 stroke-green-500" />
    </div>
  );
}
