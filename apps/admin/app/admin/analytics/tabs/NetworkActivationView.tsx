"use client";

import { useState } from "react";
import { useAcquisitionMetrics } from "@omenai/shared-hooks/hooks/useMetrics";
import { UserRole } from "@omenai/shared-types";

import { AcquisitionSkeleton } from "../ui/Skeletons";
import { ErrorState } from "../ui/Ui";
import { SankeyStage, ActivationSankey } from "./ActivationSankey";
import { DemographicsPanel } from "./DemographicPanel";

// ── Segment Identity (Softer, modern palette) ─────────────────────────────────
export const SEGMENTS: Record<
  UserRole,
  { label: string; color: string; bg: string }
> = {
  user: { label: "Collectors", color: "#60A5FA", bg: "#EFF6FF" }, // Soft Blue
  artist: { label: "Artists", color: "#FBBF24", bg: "#FFFBEB" }, // Warm Amber
  gallery: { label: "Galleries", color: "#A78BFA", bg: "#F5F3FF" }, // Soft Lavender
};

// ── Funnel Stage Builder ──────────────────────────────────────────────────────
function buildStages(segment: UserRole, data: any): SankeyStage[] {
  const { summary, activation } = data;
  switch (segment) {
    case "user":
      return [
        {
          name: "Created Account",
          shortName: "Account",
          value: 100,
          count: summary.totalCollectors,
          type: "neutral",
        },
        {
          name: "Initiated Order",
          shortName: "Initiated",
          value: activation.collectors.placedOrder.percentage,
          count: activation.collectors.placedOrder.count,
          type: "positive",
        },
        {
          name: "Paid for Order",
          shortName: "Paid",
          value: activation.collectors.paidOrder.percentage,
          count: activation.collectors.paidOrder.count,
          type: "positive",
        },
        {
          name: "Repeat Buyer",
          shortName: "Repeat",
          value: activation.collectors.repeatBuyer.percentage,
          count: activation.collectors.repeatBuyer.count,
          type: "positive",
        },
      ];
    case "artist":
      return [
        {
          name: "Created Account",
          shortName: "Account",
          value: 100,
          count: summary.totalArtists,
          type: "neutral",
        },
        {
          name: "Uploaded Artworks",
          shortName: "Uploads",
          value: activation.artists.hasArtworks.percentage,
          count: activation.artists.hasArtworks.count,
          type: "positive",
        },
        {
          name: "Active Catalog",
          shortName: "Active",
          value: activation.artists.activeCatalog.percentage,
          count: activation.artists.activeCatalog.count,
          type: "positive",
        },
        {
          name: "Sold Artworks",
          shortName: "Sales",
          value: activation.artists.hasSoldArt.percentage,
          count: activation.artists.hasSoldArt.count,
          type: "positive",
        },
      ];
    case "gallery":
      return [
        {
          name: "Total Galleries",
          shortName: "Total",
          value: 100,
          count: summary.totalGalleries,
          type: "neutral",
        },
        {
          name: "Active Subscription",
          shortName: "Active",
          value: activation.galleries.activeSubscription.percentage,
          count: activation.galleries.activeSubscription.count,
          type: "positive",
        },
        {
          name: "Sold Artworks",
          shortName: "Sales",
          value: activation.galleries.hasSoldArt.percentage,
          count: activation.galleries.hasSoldArt.count,
          type: "positive",
        },
        {
          name: "Hard Churn",
          shortName: "Hard Churn",
          value: activation.galleries.churnedHard.percentage,
          count: activation.galleries.churnedHard.count,
          type: "negative",
        },
        {
          name: "Zero-Sale Churn",
          shortName: "Zero-Sale",
          value: activation.galleries.zeroSaleChurn.percentage,
          count: activation.galleries.zeroSaleChurn.count,
          type: "negative",
        },
      ];
  }
}

// ── Isolated Components for Cleaner Code ──────────────────────────────────────

const EcosystemOverview = ({
  summary,
  totalNetwork,
}: {
  summary: any;
  totalNetwork: number;
}) => (
  <section className="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-slate-100 mb-6">
    <div className="flex items-end justify-between mb-8">
      <div>
        <p className="text-[11px] tracking-widest uppercase text-slate-400 font-medium mb-1">
          Network Activation
        </p>
        <h2 className="text-2xl font-medium text-slate-800 tracking-tight">
          Ecosystem Overview
        </h2>
      </div>
      <div className="text-right">
        <p className="text-[11px] tracking-widest uppercase text-slate-400 font-medium mb-1">
          Total Network
        </p>
        <p className="text-3xl font-medium text-slate-800 tabular-nums">
          {new Intl.NumberFormat().format(totalNetwork)}
        </p>
      </div>
    </div>

    <div className="grid grid-cols-3 gap-4 bg-slate-50/50 rounded-xl p-2 border border-slate-100">
      {[
        {
          role: "user" as UserRole,
          label: "Collectors",
          value: summary?.totalCollectors ?? 0,
          sub: "Verified buyers",
        },
        {
          role: "artist" as UserRole,
          label: "Artists",
          value: summary?.totalArtists ?? 0,
          sub: "Represented creators",
        },
        {
          role: "gallery" as UserRole,
          label: "Galleries",
          value: summary?.totalGalleries ?? 0,
          sub: "Active partners",
        },
      ].map(({ role, label, value, sub }) => (
        <div
          key={role}
          className="p-4 rounded-lg bg-white shadow-sm ring-1 ring-slate-100 flex flex-col justify-center"
        >
          <div className="flex items-center gap-2 mb-2">
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: SEGMENTS[role].color }}
            />
            <p className="text-xs tracking-wider uppercase text-slate-500 font-medium">
              {label}
            </p>
          </div>
          <p className="text-2xl font-medium text-slate-800 tabular-nums">
            {new Intl.NumberFormat().format(value)}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">{sub}</p>
        </div>
      ))}
    </div>
  </section>
);

const WaitlistCard = ({
  waitlist,
  conversionRate,
}: {
  waitlist: any;
  conversionRate: number;
}) => (
  <section className="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-slate-100 mb-6 flex flex-col justify-center">
    <div className="flex items-center justify-between mb-5">
      <p className="text-xs tracking-wider uppercase text-slate-500 font-medium">
        Waitlist Conversion
      </p>
      <div className="flex items-center gap-6 bg-emerald-50 px-4 py-2 rounded-lg">
        <div>
          <span className="text-2xl font-medium text-emerald-600 tabular-nums">
            {conversionRate}%
          </span>
          <span className="text-[10px] tracking-wider uppercase text-emerald-500/80 ml-2 font-medium">
            Rate
          </span>
        </div>
        <div className="w-px h-8 bg-emerald-200" />
        <div className="flex flex-col">
          <span className="text-sm font-medium text-slate-700 tabular-nums">
            {waitlist.converted}{" "}
            <span className="text-slate-400 font-normal mx-1">/</span>{" "}
            {waitlist.total}
          </span>
          <span className="text-[10px] tracking-wider uppercase text-slate-400">
            Leads Converted
          </span>
        </div>
      </div>
    </div>
    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
      <div
        className="h-full bg-emerald-400 rounded-full transition-all duration-1000 ease-out"
        style={{ width: `${Math.min(conversionRate, 100)}%` }}
      />
    </div>
  </section>
);

const TransitionSummary = ({ stages }: { stages: SankeyStage[] }) => {
  const pos = stages.filter((s) => s.type !== "negative");
  const transitions = pos.slice(0, -1).map((s, i) => ({
    from: s.shortName,
    to: pos[i + 1].shortName,
    rate:
      pos[i + 1].value > 0 && s.value > 0
        ? ((pos[i + 1].value / s.value) * 100).toFixed(1)
        : "0.0",
  }));

  return (
    <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 bg-slate-50 px-5 py-3 rounded-xl border border-slate-100">
      {transitions.map((t, i) => (
        <div key={i} className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-medium">{t.from}</span>
          <span className="text-slate-300">→</span>
          <span className="text-slate-400 font-medium">{t.to}</span>
          <span className="text-slate-700 font-medium tabular-nums ml-1 bg-white px-2 py-0.5 rounded shadow-sm border border-slate-100">
            {t.rate}%
          </span>
        </div>
      ))}
    </div>
  );
};

// ── Main View ─────────────────────────────────────────────────────────────────
export default function NetworkActivationView() {
  const { data, isLoading, isError } = useAcquisitionMetrics();
  const [funnelSeg, setFunnelSeg] = useState<UserRole>("user");

  if (isLoading) return <AcquisitionSkeleton />;
  if (isError || !data?.isOk || !data?.data)
    return <ErrorState message="Network data unavailable." />;

  const { summary, waitlist, demographics } = data.data;
  const conversionRate = Number(waitlist.conversionRate);
  const totalNetwork =
    (summary?.totalCollectors ?? 0) +
    (summary?.totalArtists ?? 0) +
    (summary?.totalGalleries ?? 0);

  const funnelMeta = SEGMENTS[funnelSeg];
  const funnelStages = buildStages(funnelSeg, data.data);

  return (
    <div className="max-w-full mx-auto space-y-6">
      <EcosystemOverview summary={summary} totalNetwork={totalNetwork} />
      <WaitlistCard waitlist={waitlist} conversionRate={conversionRate} />

      {/* ── Activation Funnel (Sankey) ── */}
      <section className="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-slate-100 mb-6 relative overflow-hidden">
        {/* Soft background glow matching the active segment */}
        <div
          className="absolute top-0 left-0 w-2 h-full"
          style={{ backgroundColor: funnelMeta.color }}
        />

        <div className="flex items-start justify-between mb-8 pl-4">
          <div>
            <p className="text-[11px] tracking-widest uppercase text-slate-400 font-medium mb-1">
              Activation Pipeline
            </p>
            <p className="text-sm text-slate-500">
              Stage-by-stage conversion flow with drop-off
            </p>
          </div>

          <div className="flex bg-slate-50 p-1 rounded-lg ring-1 ring-slate-100">
            {(
              Object.entries(SEGMENTS) as [
                UserRole,
                (typeof SEGMENTS)[UserRole],
              ][]
            ).map(([key, meta]) => {
              const isActive = funnelSeg === key;
              return (
                <button
                  key={key}
                  onClick={() => setFunnelSeg(key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs tracking-wider uppercase font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-white shadow-sm text-slate-800"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: isActive ? meta.color : "#E2E8F0" }}
                  />
                  {meta.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="pl-4">
          <ActivationSankey
            stages={funnelStages}
            accentColor={funnelMeta.color}
          />
          <TransitionSummary stages={funnelStages} />
        </div>
      </section>

      {/* ── Demographics ── */}
      <DemographicsPanel demographics={demographics} />
    </div>
  );
}
