"use client";

import { useState } from "react";
import { BarList, DonutChart } from "@tremor/react";
import { useAcquisitionMetrics } from "@omenai/shared-hooks/hooks/useMetrics";
import { UserRole, ChartDataItem } from "@omenai/shared-types";

import { AcquisitionSkeleton } from "../ui/Skeletons";
import { ErrorState, DonutTooltip, EmptyChart } from "../ui/Ui";

// ── Helpers ──────────────────────────────────────────────────────────────────
const sanitize = (arr: ChartDataItem[] | undefined) => {
  if (!arr || !Array.isArray(arr)) return [];
  return arr.map((item) => ({
    name: String(item?.name ?? "Unknown"),
    value: Number(item?.value ?? item?.count ?? 0),
  }));
};

const fmt = (n: number) => new Intl.NumberFormat().format(n);

const segmentLabels: Record<UserRole, string> = {
  user: "Collectors",
  artist: "Artists",
  gallery: "Galleries",
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
        className="bg-white p-5 rounded-xl shadow-sm ring-1 ring-neutral-100/80 flex flex-col justify-center"
      >
        <div className="flex items-center gap-3 mb-2">
          <span
            className={`w-2 h-2 rounded-full ${stat.color.split(" ")[0]}`}
          />
          <p className="text-xs font-medium tracking-wide uppercase text-neutral-500">
            {stat.label}
          </p>
        </div>
        <p className="text-3xl font-medium text-neutral-800 tabular-nums my-1">
          {fmt(stat.value)}
        </p>
        <p className="text-xs text-neutral-400">{stat.sub}</p>
      </div>
    ))}
  </div>
);

// ── Sub-Component: Waitlist Tracker ──────────────────────────────────────────
const WaitlistTracker = ({ waitlist }: { waitlist: any }) => {
  const rate = Number(waitlist.conversionRate);
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm ring-1 ring-neutral-100/80 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div>
          <h3 className="text-xs font-medium text-neutral-800">
            Waitlist Conversion Funnel
          </h3>
          <p className="text-xs text-neutral-500 mt-1">
            Pre-launch leads converted to registered accounts.
          </p>
        </div>
        <div className="flex items-center gap-6 bg-neutral-50 px-4 py-2 rounded-xl ring-1 ring-neutral-100">
          <div className="text-right">
            <p className="text-2xl font-medium text-teal-500 tabular-nums">
              {rate}%
            </p>
            <p className="text-[10px] uppercase tracking-wider text-neutral-400 mt-0.5">
              Conversion Rate
            </p>
          </div>
          <div className="w-px h-8 bg-neutral-200" />
          <div>
            <p className="text-xs font-medium text-neutral-700 tabular-nums">
              {fmt(waitlist.converted)}{" "}
              <span className="text-neutral-300 mx-1">/</span>{" "}
              {fmt(waitlist.total)}
            </p>
            <p className="text-[10px] uppercase tracking-wider text-neutral-400 mt-0.5">
              Waitlist Leads
            </p>
          </div>
        </div>
      </div>
      <div className="h-2.5 w-full bg-neutral-100 rounded-full overflow-hidden">
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

  // Softer, gradient-like color progressions
  const funnels = {
    user: [
      {
        name: "Created Account",
        value: 100,
        count: summary.totalCollectors,
        color: "bg-dark/50",
      },
      {
        name: "Initiated Order (Quote)",
        value: activation.collectors.placedOrder.percentage,
        count: activation.collectors.placedOrder.count,
        color: "bg-amber-300",
      },
      {
        name: "Paid for Order (Converted)",
        value: activation.collectors.paidOrder.percentage,
        count: activation.collectors.paidOrder.count,
        color: "bg-green-400",
      },
      {
        name: "Repeat Buyer (2+ Orders)",
        value: activation.collectors.repeatBuyer.percentage,
        count: activation.collectors.repeatBuyer.count,
        color: "bg-violet-400",
      },
    ],
    artist: [
      {
        name: "Created Account",
        value: 100,
        count: summary.totalArtists,
        color: "bg-neutral-200",
      },
      {
        name: "Uploaded 1+ Artworks",
        value: activation.artists.hasArtworks.percentage,
        count: activation.artists.hasArtworks.count,
        color: "bg-amber-300",
      },
      {
        name: "Active Catalog (Last 90 Days)",
        value: activation.artists.activeCatalog.percentage,
        count: activation.artists.activeCatalog.count,
        color: "bg-orange-400",
      },
      {
        name: "Sold 1+ Artworks",
        value: activation.artists.hasSoldArt.percentage,
        count: activation.artists.hasSoldArt.count,
        color: "bg-emerald-400",
      },
    ],
    gallery: [
      {
        name: "Total Galleries",
        value: 100,
        count: summary.totalGalleries,
        color: "bg-neutral-200",
      },
      {
        name: "Active Subscription",
        value: activation.galleries.activeSubscription.percentage,
        count: activation.galleries.activeSubscription.count,
        color: "bg-purple-300",
      },
      {
        name: "Sold 1+ Artworks",
        value: activation.galleries.hasSoldArt.percentage,
        count: activation.galleries.hasSoldArt.count,
        color: "bg-emerald-400",
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
        color: "bg-rose-500",
      },
    ],
  };

  const steps = funnels[segment];

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm ring-1 ring-neutral-100/80 mb-6">
      <h3 className="text-base font-medium text-neutral-800 mb-6">
        {segmentLabels[segment]} Activation Pipeline
      </h3>
      <div className="space-y-5">
        {steps.map((step, idx) => (
          <div key={idx} className="relative">
            <div className="flex justify-between items-end mb-2">
              <div>
                <p className="text-xs font-medium text-neutral-700">
                  {step.name}
                </p>
                <p className="text-xs text-neutral-400 mt-0.5">
                  {fmt(step.count)} Users
                </p>
              </div>
              <p className="text-xs font-medium text-neutral-800 tabular-nums">
                {step.value}%
              </p>
            </div>
            <div className="h-2 w-full bg-neutral-50 rounded-full overflow-hidden ring-1 ring-neutral-100 inset-ring">
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
  const countriesData = sanitize(demographics.countries[segment]);
  const referrersData = sanitize(demographics.referrers[segment]);
  const devicesData = sanitize(demographics.devices[segment]);
  const totalDevices = devicesData.reduce((acc, d) => acc + d.value, 0);

  const DonTip = ({ payload, active }: any) => (
    <div className="pointer-events-none transform -tranneutral-y-12 tranneutral-x-4">
      <DonutTooltip active={active} payload={payload} />
    </div>
  );

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm ring-1 ring-neutral-100/80">
      <h3 className="text-xs font-medium text-neutral-800 mb-6">
        {segmentLabels[segment]} Demographics
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="space-y-4">
          <p className="text-xs tracking-wider uppercase text-neutral-400 font-medium flex items-center gap-3">
            Geographical Distribution{" "}
            <span className="flex-1 h-px bg-neutral-100" />
          </p>
          {countriesData.length > 0 ? (
            <BarList
              data={countriesData}
              className="mt-2 text-xs"
              color="blue"
              showAnimation
            />
          ) : (
            <div className="h-32">
              <EmptyChart label="No country data" />
            </div>
          )}
        </div>

        <div className="space-y-4">
          <p className="text-xs tracking-wider uppercase text-neutral-400 font-medium flex items-center gap-3">
            Traffic Sources <span className="flex-1 h-px bg-neutral-100" />
          </p>
          {referrersData.length > 0 ? (
            <BarList
              data={referrersData}
              className="mt-2 text-xs"
              color="violet"
              showAnimation
            />
          ) : (
            <div className="h-32">
              <EmptyChart label="No referrer data" />
            </div>
          )}
        </div>

        {/* Device Split */}
        <div className="space-y-4">
          <p className="text-xs tracking-wider uppercase text-neutral-400 font-medium flex items-center gap-3">
            Device Split <span className="flex-1 h-px bg-neutral-100" />
          </p>

          {devicesData.length > 0 ? (
            <div className="flex flex-col xl:flex-row xl:items-center gap-6 mt-4">
              {/* Left: The Donut Chart */}
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
                        // Custom offset tooltip pushed up and to the right
                        <div className="pointer-events-none cursor-pointer  transform -translate-y-10 translate-x-8 bg-white px-3.5 py-2.5 rounded-xl shadow-xl ring-1 ring-neutral-100/50 min-w-[120px]">
                          <p className="text-[9px] tracking-widest uppercase text-neutral-400 font-medium mb-1">
                            {data.name}
                          </p>
                          <p className="text-lg font-medium text-neutral-800 tabular-nums leading-none">
                            {fmt(data.value)}
                          </p>
                        </div>
                      );
                    }}
                  />
                </div>
                {/* Center Label */}
                <div className="absolute z-0 inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[9px] tracking-widest uppercase text-neutral-400 font-medium">
                    Total
                  </span>
                  <span className="text-lg font-medium text-neutral-800 tabular-nums mt-0.5">
                    {fmt(totalDevices)}
                  </span>
                </div>
              </div>

              {/* Right: The Data Legend */}
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
                        <span className="text-xs tracking-wide uppercase text-neutral-600 font-medium">
                          {d.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-neutral-400 font-medium tabular-nums">
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
        <div className="flex bg-neutral-100 p-1 rounded-xl ring-1 ring-neutral-200">
          {(["user", "artist", "gallery"] as UserRole[]).map((role) => (
            <button
              key={role}
              onClick={() => setActiveSegment(role)}
              className={`px-5 py-2 text-xs font-semibold tracking-wide uppercase rounded-lg transition-all duration-200 ${
                activeSegment === role
                  ? "bg-white text-neutral-800 shadow-sm ring-1 ring-neutral-200/50"
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
      <div className="hidden bg-blue-400 bg-violet-400 bg-cyan-400 bg-indigo-400 fill-blue-400 fill-violet-400 fill-cyan-400 fill-indigo-400 bg-neutral-200 bg-sky-300 bg-emerald-400 bg-amber-300 bg-orange-400 bg-purple-300 bg-rose-400 bg-rose-500 bg-blue-100 text-blue-600 bg-amber-100 text-amber-600 bg-purple-100 text-purple-600" />
    </div>
  );
}
