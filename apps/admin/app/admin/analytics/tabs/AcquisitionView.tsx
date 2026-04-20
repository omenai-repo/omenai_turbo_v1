"use client";

import { useState } from "react";
import { BarList, DonutChart } from "@tremor/react";
import { useAcquisitionMetrics } from "@omenai/shared-hooks/hooks/useMetrics";
import { UserRole, ChartDataItem } from "@omenai/shared-types";

import { AcquisitionSkeleton } from "../ui/Skeletons";
import { ErrorState, DonutTooltip, EmptyChart } from "../ui/Ui";

// ── Helpers ──────────────────────────────────────────────────────────────────

// Safely decodes URI strings (e.g., "Fort%20Libert%C3%A9" -> "Fort Liberté")
const decodeSafe = (str: string) => {
  if (!str) return "Unknown";
  try {
    return decodeURIComponent(str);
  } catch (e) {
    return str; // Fallback to raw string if decoding fails
  }
};

const sanitize = (arr: ChartDataItem[] | undefined) => {
  if (!arr || !Array.isArray(arr)) return [];
  return arr.map((item) => ({
    name: decodeSafe(String(item?.name ?? "Unknown")),
    value: Number(item?.value ?? item?.count ?? 0),
  }));
};

const fmt = (n: number) => new Intl.NumberFormat().format(n);

const segmentLabels: Record<UserRole, string> = {
  user: "Collectors",
  artist: "Artists",
  gallery: "Galleries",
};

// ── Sub-Component: Demographic Column (with Custom Scrollable Modal) ─────────
const DemographicColumn = ({
  title,
  data,
  color,
}: {
  title: string;
  data: { name: string; value: number }[];
  color: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // 1. Sort the data: Highest value first, but force "Unknown" to the absolute bottom.
  const sortedData = [...data].sort((a, b) => {
    if (a.name === "Unknown") return 1;
    if (b.name === "Unknown") return -1;
    return b.value - a.value;
  });

  const top5 = sortedData.slice(0, 5);
  const hasMore = sortedData.length > 5;

  return (
    <div className="space-y-4 flex flex-col h-full">
      <p className="text-xs tracking-wider uppercase text-neutral-400 font-normal flex items-center gap-3">
        {title} <span className="flex-1 h-px bg-neutral-100" />
      </p>

      {sortedData.length > 0 ? (
        <div className="flex-1 flex flex-col">
          <BarList
            data={top5}
            className="mt-2 text-xs"
            color={color}
            showAnimation
          />

          {hasMore && (
            <button
              onClick={() => setIsOpen(true)}
              className="mt-6 w-full py-2.5 text-xs font-normal text-neutral-600 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200/60 rounded-xl transition-colors"
            >
              View all {sortedData.length} records
            </button>
          )}
        </div>
      ) : (
        <div className="h-32 flex items-center justify-center">
          <EmptyChart label={`No ${title.toLowerCase()} data`} />
        </div>
      )}

      {/* ── CUSTOM FIXED OVERLAY MODAL (Perfectly Centered & Scrollable) ── */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal Panel */}
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl ring-1 ring-neutral-200/50 flex flex-col max-h-[85vh] overflow-hidden transform transition-all">
            {/* Pinned Header */}
            <div className="px-6 py-5 border-b border-neutral-100/80 flex items-center justify-between shrink-0 bg-white z-10">
              <div>
                <h3 className="text-base font-normal text-neutral-800">
                  All {title}
                </h3>
                <p className="text-xs text-neutral-500 mt-1 font-normal">
                  Showing all {sortedData.length} recorded items
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-full transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Scrollable Content Area */}
            <div className="px-6 py-6 overflow-y-auto flex-1 custom-scrollbar">
              <BarList
                data={sortedData}
                color={color}
                className="text-sm font-normal text-neutral-600"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Sub-Component: Ecosystem Overview ────────────────────────────────────────
const EcosystemOverview = ({ summary }: { summary: any }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
    {[
      {
        label: "Total Collectors",
        value: summary?.totalCollectors ?? 0,
        sub: "Verified buyers",
        color: "bg-blue-100 text-blue-600",
      },
      {
        label: "Total Artists",
        value: summary?.totalArtists ?? 0,
        sub: "Represented creators",
        color: "bg-amber-100 text-amber-600",
      },
      {
        label: "Total Galleries",
        value: summary?.totalGalleries ?? 0,
        sub: "Verified Gallery partners",
        color: "bg-purple-100 text-purple-600",
      },
    ].map((stat, i) => (
      <div
        key={i}
        className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100/60 flex flex-col justify-center"
      >
        <div className="flex items-center gap-3 mb-2">
          <span
            className={`w-2 h-2 rounded-full ${stat.color.split(" ")[0]}`}
          />
          <p className="text-[10px] font-medium tracking-widest uppercase text-neutral-500">
            {stat.label}
          </p>
        </div>
        <p className="text-2xl font-normal text-neutral-800 tabular-nums my-1">
          {fmt(stat.value)}
        </p>
        <p className="text-[11px] font-normal text-neutral-500">{stat.sub}</p>
      </div>
    ))}
  </div>
);

// ── Sub-Component: Waitlist Tracker ──────────────────────────────────────────
const WaitlistTracker = ({ waitlist }: { waitlist: any }) => {
  const rate = Number(waitlist.conversionRate);
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100/60 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div>
          <h3 className="text-sm font-normal text-neutral-800">
            Waitlist Conversion Funnel
          </h3>
          <p className="text-xs font-normal text-neutral-500 mt-1">
            Pre-launch leads converted to registered accounts.
          </p>
        </div>
        <div className="flex items-center gap-6 bg-neutral-50/80 px-4 py-2.5 rounded-xl border border-neutral-100">
          <div className="text-right">
            <p className="text-2xl font-normal text-teal-600 tabular-nums">
              {rate}%
            </p>
            <p className="text-[9px] uppercase tracking-widest font-normal text-neutral-400 mt-0.5">
              Conversion Rate
            </p>
          </div>
          <div className="w-px h-8 bg-neutral-200" />
          <div>
            <p className="text-sm font-normal text-neutral-800 tabular-nums">
              {fmt(waitlist.converted)}{" "}
              <span className="text-neutral-300 mx-1 font-normal">/</span>{" "}
              {fmt(waitlist.total)}
            </p>
            <p className="text-[9px] uppercase tracking-widest font-normal text-neutral-400 mt-1">
              Waitlist Leads
            </p>
          </div>
        </div>
      </div>
      <div className="h-2 w-full bg-neutral-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-teal-400 rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${Math.min(rate, 100)}%` }}
        />
      </div>
    </div>
  );
};

// ── Sub-Component: Activation Pipeline ───────────────────────────────────────
const ActivationPipeline = ({
  segment,
  data,
}: {
  segment: UserRole;
  data: any;
}) => {
  const { summary, activation } = data;

  const funnels = {
    user: [
      {
        name: "Created Account",
        value: 100,
        count: summary.totalCollectors,
        color: "bg-neutral-800/80",
      },
      {
        name: "Initiated Order (Quote)",
        value: activation.collectors.placedOrder.percentage,
        count: activation.collectors.placedOrder.count,
        color: "bg-amber-400",
      },
      {
        name: "Paid for Order (Converted)",
        value: activation.collectors.paidOrder.percentage,
        count: activation.collectors.paidOrder.count,
        color: "bg-green-500",
      },
      {
        name: "Repeat Buyer (2+ Orders)",
        value: activation.collectors.repeatBuyer.percentage,
        count: activation.collectors.repeatBuyer.count,
        color: "bg-violet-500",
      },
    ],
    artist: [
      {
        name: "Created Account",
        value: 100,
        count: summary.totalArtists,
        color: "bg-neutral-300",
      },
      {
        name: "Uploaded 1+ Artworks",
        value: activation.artists.hasArtworks.percentage,
        count: activation.artists.hasArtworks.count,
        color: "bg-amber-400",
      },
      {
        name: "Active Catalog (Last 90 Days)",
        value: activation.artists.activeCatalog.percentage,
        count: activation.artists.activeCatalog.count,
        color: "bg-orange-500",
      },
      {
        name: "Sold 1+ Artworks",
        value: activation.artists.hasSoldArt.percentage,
        count: activation.artists.hasSoldArt.count,
        color: "bg-emerald-500",
      },
    ],
    gallery: [
      {
        name: "Total Galleries",
        value: 100,
        count: summary.totalGalleries,
        color: "bg-neutral-300",
      },
      {
        name: "Active Subscription",
        value: activation.galleries.activeSubscription.percentage,
        count: activation.galleries.activeSubscription.count,
        color: "bg-purple-400",
      },
      {
        name: "Sold 1+ Artworks",
        value: activation.galleries.hasSoldArt.percentage,
        count: activation.galleries.hasSoldArt.count,
        color: "bg-emerald-500",
      },
      {
        name: "Hard Churn (> 90 Days Expired) - Expired subscriptions",
        value: activation.galleries.churnedHard.percentage,
        count: activation.galleries.churnedHard.count,
        color: "bg-rose-400",
      },
      {
        name: "Zero-Sale Churn",
        value: activation.galleries.zeroSaleChurn.percentage,
        count: activation.galleries.zeroSaleChurn.count,
        color: "bg-rose-600",
      },
    ],
  };

  const steps = funnels[segment];

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100/60 mb-6">
      <h3 className="text-sm font-normal text-neutral-800 mb-6">
        {segmentLabels[segment]} Activation Pipeline
      </h3>
      <div className="space-y-6">
        {steps.map((step, idx) => (
          <div key={idx} className="relative">
            <div className="flex justify-between items-end mb-2.5">
              <div>
                <p className="text-xs font-normal text-neutral-700">
                  {step.name}
                </p>
                <p className="text-[11px] font-normal text-neutral-400 mt-0.5">
                  {fmt(step.count)} Users
                </p>
              </div>
              <p className="text-xs font-medium text-neutral-800 tabular-nums">
                {step.value}%
              </p>
            </div>
            <div className="h-2 w-full bg-neutral-100/80 rounded-full overflow-hidden border border-neutral-200/50">
              <div
                className={`h-full ${step.color} rounded-full transition-all duration-1000 ease-out`}
                style={{ width: `${Math.max(step.value, 1)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Sub-Component: Demographic Grid ──────────────────────────────────────────
const DemographicGrid = ({
  segment,
  demographics,
}: {
  segment: UserRole;
  demographics: any;
}) => {
  console.log(demographics);
  const countriesData = sanitize(demographics.countries[segment]);
  const referrersData = sanitize(demographics.referrers[segment]);
  const devicesData = sanitize(demographics.devices[segment]);
  const totalDevices = devicesData.reduce((acc, d) => acc + d.value, 0);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100/60">
      <h3 className="text-sm font-normal text-neutral-800 mb-6">
        {segmentLabels[segment]} Demographics
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Geographic Column */}
        <DemographicColumn
          title="Geographical Distribution"
          data={countriesData}
          color="blue"
        />

        {/* Referrer Column */}
        <DemographicColumn
          title="Traffic Sources"
          data={referrersData}
          color="violet"
        />

        {/* Device Split (Custom Donut Chart) */}
        <div className="space-y-4">
          <p className="text-xs tracking-wider uppercase text-neutral-400 font-normal flex items-center gap-3">
            Device Split <span className="flex-1 h-px bg-neutral-100" />
          </p>

          {devicesData.length > 0 ? (
            <div className="flex flex-col xl:flex-row xl:items-center gap-6 mt-4">
              <div className="relative w-36 h-36 shrink-0 overflow-visible">
                <div className="absolute z-10 inset-0 overflow-visible">
                  <DonutChart
                    data={devicesData}
                    category="value"
                    index="name"
                    colors={["blue", "amber", "violet", "indigo"]}
                    className="h-full w-full overflow-visible"
                    showLabel={false}
                    showAnimation
                    customTooltip={({ payload, active }: any) => {
                      if (!active || !payload || payload.length === 0)
                        return null;
                      const data = payload[0].payload;
                      return (
                        <div className="pointer-events-none cursor-pointer transform -translate-y-10 translate-x-8 bg-white/90 backdrop-blur-md border border-neutral-200/60 px-3.5 py-2.5 rounded-xl shadow-xl min-w-[120px]">
                          <p className="text-[9px] tracking-widest uppercase text-neutral-500 font-normal mb-1">
                            {data.name}
                          </p>
                          <p className="text-lg font-normal text-neutral-800 tabular-nums leading-none">
                            {fmt(data.value)}
                          </p>
                        </div>
                      );
                    }}
                  />
                </div>
                <div className="absolute z-0 inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[9px] tracking-widest uppercase text-neutral-400 font-normal">
                    Total
                  </span>
                  <span className="text-lg font-normal text-neutral-800 tabular-nums mt-0.5">
                    {fmt(totalDevices)}
                  </span>
                </div>
              </div>

              <div className="flex-1 space-y-3 w-full">
                {devicesData.map((d, i) => {
                  const dotColors = [
                    "bg-blue-500",
                    "bg-amber-500",
                    "bg-violet-500",
                    "bg-indigo-500",
                  ];
                  return (
                    <div
                      key={d.name}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`w-2 h-2 rounded-full ${dotColors[i % dotColors.length]}`}
                        />
                        <span className="text-xs tracking-wide uppercase text-neutral-600 font-normal">
                          {d.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-neutral-400 font-normal tabular-nums">
                          {totalDevices > 0
                            ? `${((d.value / totalDevices) * 100).toFixed(0)}%`
                            : "—"}
                        </span>
                        <span className="text-xs font-normal text-neutral-700 tabular-nums text-right">
                          {fmt(d.value)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="h-40 flex items-center justify-center">
              <EmptyChart label="No device data" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Main Controller ──────────────────────────────────────────────────────────
export default function NetworkActivationView() {
  const { data, isLoading, isError } = useAcquisitionMetrics();
  const [activeSegment, setActiveSegment] = useState<UserRole>("user");

  if (isLoading) return <AcquisitionSkeleton />;
  if (isError || !data?.isOk || !data?.data)
    return <ErrorState message="Network data unavailable." />;

  const { summary, waitlist, demographics } = data.data;

  return (
    <div className="max-w-full mx-auto space-y-2">
      <EcosystemOverview summary={summary} />
      <WaitlistTracker waitlist={waitlist} />

      {/* ── Segment Controller Switcher ── */}
      <div className="flex justify-end pt-4 pb-2">
        <div className="flex bg-white p-1 rounded-xl shadow-sm border border-neutral-200/60">
          {(["user", "artist", "gallery"] as UserRole[]).map((role) => (
            <button
              key={role}
              onClick={() => setActiveSegment(role)}
              className={`px-5 py-2 text-xs font-medium tracking-wide uppercase rounded-lg transition-all duration-200 ${
                activeSegment === role
                  ? "bg-neutral-100 text-neutral-800"
                  : "text-neutral-400 hover:text-neutral-600"
              }`}
            >
              {segmentLabels[role]}
            </button>
          ))}
        </div>
      </div>

      <ActivationPipeline segment={activeSegment} data={data.data} />
      <DemographicGrid segment={activeSegment} demographics={demographics} />

      {/* Tremor safelist + Tailwind Dynamic Colors */}
      <div className="hidden bg-blue-400 bg-violet-400 bg-cyan-400 bg-indigo-400 fill-blue-400 fill-violet-400 fill-cyan-400 fill-indigo-400 bg-neutral-200 bg-neutral-300 bg-neutral-800/80 bg-sky-300 bg-emerald-400 bg-emerald-500 bg-amber-300 bg-amber-400 bg-orange-400 bg-orange-500 bg-purple-300 bg-purple-400 bg-violet-500 bg-rose-400 bg-rose-500 bg-rose-600 bg-green-500 bg-blue-100 text-blue-600 bg-amber-100 text-amber-600 bg-purple-100 text-purple-600" />
    </div>
  );
}
