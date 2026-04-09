"use client";

import { useState } from "react";
import { TrendingUp, Globe, Package, Activity } from "lucide-react";
import FinancialView from "../tabs/FinancialView";
import OperationalView from "../tabs/OperationalView";
import EngagementView from "../tabs/EngagementView";
import NetworkActivationView from "../tabs/AcquisitionView";

const tabs = [
  {
    id: "financial",
    label: "Financial",
    icon: TrendingUp,
    description: "GMV, revenue & margins",
  },
  {
    id: "acquisition",
    label: "User Engagement",
    icon: Globe,
    description: "Waitlist & User engagement",
  },
  {
    id: "operational",
    label: "Logistics",
    icon: Package,
    description: "Order Fulfillment & pipeline",
  },
  {
    id: "engagements",
    label: "Engagement",
    icon: Activity,
    description: "Platform funnel",
  },
] as const;

type TabId = (typeof tabs)[number]["id"];

export default function AnalyticsTabs() {
  const [activeTab, setActiveTab] = useState<TabId>("financial");

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-7 px-4 py-6 font-sans">
      {/* ── Header ── */}
      <header className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
            </span>
            <p className="text-[9px] font-semibold tracking-[0.22em] text-emerald-600 uppercase">
              Platform Intelligence · Live
            </p>
          </div>
          <h1 className="font-serif text-xl font-normal text-[#0E1B2E] tracking-tight">
            Analytics Overview
          </h1>
        </div>

        <div className="text-right hidden sm:block">
          <p className="text-[9px] tracking-[0.2em] uppercase text-[#B0B8C1]">
            Data refreshed
          </p>
          <p className="text-xs text-[#8A96A3] font-light mt-0.5">
            {new Intl.DateTimeFormat("en-US", {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }).format(new Date())}
          </p>
        </div>
      </header>

      {/* ── Tab Navigation ── */}
      <nav className="relative">
        <div className="flex gap-1 bg-[#F3F6F9] p-1 rounded-xl w-fit">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  group relative flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-medium
                  transition-all duration-200 whitespace-nowrap
                  ${
                    isActive
                      ? "bg-white text-[#0E1B2E] shadow-[0_1px_4px_rgba(0,0,0,0.08)]"
                      : "text-[#8A96A3] hover:text-[#3A4A5C] hover:bg-white/50"
                  }
                `}
              >
                <Icon
                  className={`w-3.5 h-3.5 transition-colors ${
                    isActive
                      ? "text-[#0E1B2E]"
                      : "text-[#B0B8C1] group-hover:text-[#8A96A3]"
                  }`}
                />
                <span>{tab.label}</span>
                {isActive && (
                  <span className="hidden md:inline text-[9px] tracking-wide text-[#B0B8C1] font-normal border-l border-[#E8ECF0] pl-2 ml-1">
                    {tab.description}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* thin divider below nav */}
        <div className="mt-5 h-px w-full bg-gradient-to-r from-[#E8ECF0] via-[#F1F4F7] to-transparent" />
      </nav>

      {/* ── Active View ── */}
      <div
        key={activeTab}
        className="animate-in fade-in slide-in-from-bottom-2 duration-400"
      >
        {activeTab === "financial" && <FinancialView />}
        {activeTab === "acquisition" && <NetworkActivationView />}
        {activeTab === "operational" && <OperationalView />}
        {activeTab === "engagements" && <EngagementView />}
      </div>
    </div>
  );
}
