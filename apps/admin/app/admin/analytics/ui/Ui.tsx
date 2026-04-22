"use client";

import React from "react";

// ─── METRIC CARD ───────────────────────────────────────────────────────────────
interface MetricCardProps {
  label: string;
  value: string | number;
  sub?: string;
  badge?: {
    text: string;
    variant: "amber" | "rose" | "purple" | "emerald" | "blue";
  };
  delay?: number;
  height?: string;
  className?: string;
}

export function MetricCard({
  label,
  value,
  sub,
  badge,
  delay = 0,
  height = "h-36",
  className = "",
}: MetricCardProps) {
  const badgeStyles = {
    amber: "bg-amber-100 text-amber-800",
    rose: "bg-rose-100 text-rose-800",
    purple: "bg-purple-100 text-purple-800",
    emerald: "bg-emerald-100 text-emerald-800",
    blue: "bg-blue-100 text-blue-800",
  };

  const cardStyles = {
    amber: "bg-amber-50/40 border-amber-100",
    rose: "bg-rose-50/40 border-rose-100",
    purple: "bg-purple-50/40 border-purple-100",
    emerald: "bg-emerald-50/40 border-emerald-100",
    blue: "bg-blue-50/40 border-blue-100",
  };

  const labelStyles = {
    amber: "text-amber-700",
    rose: "text-rose-700",
    purple: "text-purple-700",
    emerald: "text-emerald-700",
    blue: "text-blue-700",
  };

  const valueStyles = {
    amber: "text-amber-900",
    rose: "text-rose-900",
    purple: "text-purple-900",
    emerald: "text-emerald-900",
    blue: "text-blue-900",
  };

  const subStyles = {
    amber: "text-amber-700/60",
    rose: "text-rose-700/60",
    purple: "text-purple-700/60",
    emerald: "text-emerald-700/60",
    blue: "text-blue-700/60",
  };

  const isColored = !!badge;
  const variant = badge?.variant;

  return (
    <div
      className={`
        rounded-xl border p-6 shadow-[0_1px_4px_rgba(0,0,0,0.04)] flex flex-col
        transition-all hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:-translate-y-0.5
        animate-in fade-in slide-in-from-bottom-3 duration-700
        ${height} ${className}
        ${isColored && variant ? cardStyles[variant] : "bg-white border-[#E8ECF0]"}
      `}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between">
        <p
          className={`text-[10px] tracking-[0.18em] uppercase font-medium ${
            isColored && variant ? labelStyles[variant] : "text-[#8A96A3]"
          }`}
        >
          {label}
        </p>
        {badge && (
          <span
            className={`px-2 py-0.5 text-[9px] font-semibold uppercase rounded-md tracking-wider ${badgeStyles[badge.variant]}`}
          >
            {badge.text}
          </span>
        )}
      </div>
      <div className="mt-auto">
        <p
          className={`font -serif text-2xl font-normal tracking-tight leading-none ${
            isColored && variant ? valueStyles[variant] : "text-[#0E1B2E]"
          }`}
        >
          {value}
        </p>
        {sub && (
          <p
            className={`text-[10px] mt-2 font-normal ${
              isColored && variant ? subStyles[variant] : "text-[#8A96A3]"
            }`}
          >
            {sub}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── SECTION PANEL ─────────────────────────────────────────────────────────────
interface SectionPanelProps {
  title: string;
  children: React.ReactNode;
  delay?: number;
  className?: string;
  headerRight?: React.ReactNode;
}

export function SectionPanel({
  title,
  children,
  delay = 0,
  className = "",
  headerRight,
}: SectionPanelProps) {
  return (
    <div
      className={`bg-white rounded-xl border border-[#E8ECF0] p-7 shadow-[0_1px_4px_rgba(0,0,0,0.04)] animate-in fade-in slide-in-from-bottom-4 duration-700 ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <h3 className="text-[10px] tracking-[0.2em] text-[#0E1B2E] uppercase font-semibold whitespace-nowrap">
            {title}
          </h3>
          <div className="flex-1 h-px bg-gradient-to-r from-[#E8ECF0] to-transparent w-16" />
        </div>
        {headerRight && <div>{headerRight}</div>}
      </div>
      {children}
    </div>
  );
}

// ─── LOADING SKELETON ──────────────────────────────────────────────────────────
interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`bg-gradient-to-r from-[#F1F4F7] via-[#E8ECF0] to-[#F1F4F7] bg-[length:400%_100%] animate-[shimmer_1.8s_ease-in-out_infinite] rounded-xl ${className}`}
    />
  );
}

// ─── ERROR STATE ───────────────────────────────────────────────────────────────
export function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex h-64 items-center justify-center rounded-2xl border border-rose-100 bg-rose-50/30">
      <div className="text-center space-y-1">
        <p className="text-[11px] tracking-[0.15em] uppercase text-rose-400 font-medium">
          Data Unavailable
        </p>
        <p className="text-sm text-rose-400/70 font-normal">{message}</p>
      </div>
    </div>
  );
}

// ─── EMPTY CHART STATE ─────────────────────────────────────────────────────────
export function EmptyChart({ label }: { label?: string }) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-3 select-none">
      <div className="flex items-end gap-1.5 opacity-20">
        {[40, 65, 45, 80, 55, 70, 38, 60].map((h, i) => (
          <div
            key={i}
            className="w-4 bg-[#B0B8C1] rounded-t-sm"
            style={{ height: `${h}px` }}
          />
        ))}
      </div>
      <p className="text-[10px] tracking-[0.18em] uppercase text-[#B0B8C1]">
        {label ?? "No data available"}
      </p>
    </div>
  );
}

// ─── CHART TOOLTIP ─────────────────────────────────────────────────────────────
interface TooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  formatter?: (value: number, key: string) => string;
}

export function ChartTooltip({
  active,
  payload,
  label,
  formatter,
}: TooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  const fmt = formatter ?? ((v: number) => new Intl.NumberFormat().format(v));

  return (
    <div className="bg-white/98 backdrop-blur-sm border border-[#E8ECF0] shadow-[0_8px_32px_rgba(0,0,0,0.08)] rounded-xl p-4 pointer-events-none min-w-[160px] transition-all duration-150">
      {label && (
        <p className="text-[9px] tracking-[0.2em] uppercase text-[#8A96A3] font-medium mb-3">
          {label}
        </p>
      )}
      <div className="space-y-2.5">
        {payload.map((entry: any, idx: number) => (
          <div key={idx} className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-[10px] tracking-wide text-[#8A96A3] uppercase">
                {entry.dataKey ?? entry.name}
              </span>
            </div>
            <span className="font -serif text-sm text-[#0E1B2E]">
              {fmt(entry.value, entry.dataKey)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── DONUT TOOLTIP ─────────────────────────────────────────────────────────────
interface DonutTooltipProps {
  active?: boolean;
  payload?: any[];
  formatter?: (v: number) => string;
}

export function DonutTooltip({
  active,
  payload,
  formatter,
}: DonutTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const item = payload[0];
  const fmt = formatter ?? ((v: number) => new Intl.NumberFormat().format(v));

  return (
    <div className="bg-white border border-[#E8ECF0] shadow-[0_8px_32px_rgba(0,0,0,0.08)] rounded-xl p-3.5 pointer-events-none transform translate-x-3 -translate-y-2 transition-all duration-150">
      <div className="flex items-center gap-2 mb-1.5">
        <span
          className="w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: item.color }}
        />
        <p className="text-[9px] tracking-[0.2em] uppercase text-[#8A96A3] font-medium">
          {item.payload?.name ?? item.name}
        </p>
      </div>
      <p className="font -serif text-base text-[#0E1B2E]">{fmt(item.value)}</p>
    </div>
  );
}
