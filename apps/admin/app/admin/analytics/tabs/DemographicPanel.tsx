"use client";

import { useState } from "react";
import { DonutChart } from "@tremor/react";
import { ChartDataItem, UserRole } from "@omenai/shared-types";
import { SEGMENTS } from "./NetworkActivationView"; // Import the standardized palette

interface Props {
  demographics: {
    countries: Record<UserRole, ChartDataItem[]>;
    referrers: Record<UserRole, ChartDataItem[]>;
    devices: Record<UserRole, ChartDataItem[]>;
  };
}

const sanitize = (arr: ChartDataItem[] | undefined) => {
  if (!arr || !Array.isArray(arr)) return [];
  return arr.map((item) => ({
    name: String(item?.name ?? "Unknown"),
    value: Number(item?.value ?? item?.count ?? 0),
  }));
};

// ── Softer Bar List Component ────────────────────────────────────────────────
function DataBarList({
  data,
  color,
}: {
  data: { name: string; value: number }[];
  color: string;
}) {
  if (!data.length)
    return (
      <div className="h-28 flex items-center justify-center bg-slate-50 rounded-xl border border-slate-100 border-dashed">
        <p className="text-[11px] tracking-widest uppercase text-slate-400 font-medium">
          No data available
        </p>
      </div>
    );

  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="space-y-4">
      {data.map((item, i) => (
        <div key={i} className="flex items-center gap-4">
          <span className="text-xs text-slate-600 font-medium w-28 flex-shrink-0 truncate">
            {item.name}
          </span>
          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${(item.value / max) * 100}%`,
                background: color,
              }}
            />
          </div>
          <span className="text-xs text-slate-500 tabular-nums w-8 text-right font-medium">
            {item.value}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Refined Donut Tooltip ───────────────────────────────────────────────────
function DonTip({ payload, active }: any) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div className="bg-white/95 backdrop-blur-sm border border-slate-100 rounded-lg shadow-md px-4 py-3 transform -translate-y-2 translate-x-2 pointer-events-none">
      <p className="text-[10px] tracking-wider uppercase text-slate-400 font-medium mb-1">
        {item.payload?.name}
      </p>
      <p className="text-lg text-slate-800 font-medium tabular-nums leading-none">
        {item.value}
      </p>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export function DemographicsPanel({ demographics }: Props) {
  const [segment, setSegment] = useState<UserRole>("user");
  const meta = SEGMENTS[segment];

  const countries = sanitize(demographics.countries[segment]);
  const referrers = sanitize(demographics.referrers[segment]);
  const devices = sanitize(demographics.devices[segment]);
  const totalDevices = devices.reduce((a, d) => a + d.value, 0);

  const DOT_COLORS = [
    "bg-blue-400",
    "bg-violet-400",
    "bg-cyan-400",
    "bg-indigo-400",
  ];

  return (
    <section className="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-slate-100">
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-[11px] tracking-widest uppercase text-slate-400 font-medium mb-1">
            Traffic Demographics
          </p>
          <p className="text-sm text-slate-500">
            Geography, sources & device distribution per segment
          </p>
        </div>

        {/* Independent segment switcher */}
        <div className="flex bg-slate-50 p-1 rounded-lg ring-1 ring-slate-100">
          {(
            Object.entries(SEGMENTS) as [
              UserRole,
              (typeof SEGMENTS)[UserRole],
            ][]
          ).map(([key, seg]) => {
            const isActive = segment === key;
            return (
              <button
                key={key}
                onClick={() => setSegment(key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs tracking-wider uppercase font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-white shadow-sm text-slate-800"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: isActive ? seg.color : "#E2E8F0" }}
                />
                {seg.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
        {/* Left Side: Countries & Referrers */}
        <div className="col-span-3 space-y-10">
          <div>
            <p className="text-[11px] tracking-widest uppercase text-slate-400 font-medium mb-5 flex items-center gap-4">
              Top Countries <span className="flex-1 h-px bg-slate-100" />
            </p>
            <DataBarList data={countries} color={meta.color} />
          </div>

          <div>
            <p className="text-[11px] tracking-widest uppercase text-slate-400 font-medium mb-5 flex items-center gap-4">
              Traffic Sources <span className="flex-1 h-px bg-slate-100" />
            </p>
            <DataBarList data={referrers} color={meta.color} />
          </div>
        </div>

        {/* Right Side: Device Donut */}
        <div className="col-span-2">
          <p className="text-[11px] tracking-widest uppercase text-slate-400 font-medium mb-5 flex items-center gap-4">
            Device Split <span className="flex-1 h-px bg-slate-100" />
          </p>

          {devices.length > 0 ? (
            <div className="flex flex-col items-center bg-slate-50 rounded-2xl p-6 border border-slate-100">
              <div className="relative w-48 h-48 overflow-visible mb-8">
                <div className="absolute inset-0 overflow-visible">
                  <DonutChart
                    data={devices}
                    category="value"
                    index="name"
                    colors={["blue", "violet", "cyan", "indigo"]}
                    className="w-full h-full overflow-visible"
                    showLabel={false}
                    showAnimation
                    customTooltip={DonTip}
                  />
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[10px] tracking-widest uppercase text-slate-400 font-medium">
                    Total
                  </span>
                  <span className="text-2xl font-medium text-slate-800 tabular-nums">
                    {totalDevices}
                  </span>
                </div>
              </div>

              <div className="w-full space-y-3">
                {devices.map((d, i) => (
                  <div
                    key={d.name}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-2 h-2 rounded-full ${DOT_COLORS[i % DOT_COLORS.length]}`}
                      />
                      <span className="text-xs tracking-wider uppercase text-slate-600 font-medium">
                        {d.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-400 tabular-nums font-medium">
                        {totalDevices > 0
                          ? `${((d.value / totalDevices) * 100).toFixed(0)}%`
                          : "—"}
                      </span>
                      <span className="text-sm font-medium text-slate-700 tabular-nums w-10 text-right">
                        {d.value}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center bg-slate-50 rounded-xl border border-slate-100 border-dashed">
              <p className="text-[11px] tracking-widest uppercase text-slate-400 font-medium">
                No device data
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="hidden bg-blue-400 bg-violet-400 bg-cyan-400 bg-indigo-400 fill-blue-400 fill-violet-400 fill-cyan-400 fill-indigo-400" />
    </section>
  );
}
