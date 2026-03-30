"use client";

import { useOperationalMetrics } from "@omenai/shared-hooks/hooks/useMetrics";
import { BarList, DonutChart } from "@tremor/react";

import { OperationalSkeleton } from "../ui/Skeletons";
import {
  ErrorState,
  DonutTooltip,
  MetricCard,
  SectionPanel,
  EmptyChart,
} from "../ui/Ui";

export default function OperationalView() {
  const { data, isLoading, isError } = useOperationalMetrics();

  if (isLoading) return <OperationalSkeleton />;
  if (isError || !data?.isOk || !data?.data)
    return <ErrorState message="Operations data currently unreachable." />;

  // 1. Map to our new locked-in data contract
  const {
    timeToQuoteHours,
    abandonmentRate,
    ghostRate,
    rejectionRate,
    totals,
    activeBottlenecks,
  } = data.data;

  // 2. Prepare BarList Data (Total Order Attrition by Reason)
  const frictionData = [
    { name: "Orders Abandoned at checkout", value: totals.abandoned },
    { name: "Auto-Declined (Ghosted by Seller)", value: totals.ghosted },
    { name: "Manually Rejected by seller", value: totals.rejected },
  ].filter((item) => item.value > 0);

  // 3. Prepare Donut Data (Decline Breakdown)
  const totalLost = totals.abandoned + totals.ghosted + totals.rejected;
  const donutData = [
    { name: "Abandoned", amount: totals.abandoned },
    { name: "Ghosted", amount: totals.ghosted },
    { name: "Rejected", amount: totals.rejected },
  ].filter((item) => item.amount > 0);

  const DonTip = ({ payload, active }: any) => (
    <DonutTooltip
      active={active}
      payload={payload}
      formatter={(v) => `${v} orders`}
    />
  );

  return (
    <div className="space-y-5">
      {/* ── Key Operational Metrics ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pipeline Velocity */}
        <MetricCard
          label="Time-to-Quote"
          value={`${timeToQuoteHours} hrs`}
          sub="Average order response time"
          delay={0}
        />

        {/* Active Bottlenecks */}
        <MetricCard
          label="In Exhibition"
          value={activeBottlenecks.inExhibition}
          sub="Orders currently on exhibitions"
          badge={{ text: "Action", variant: "amber" }}
          delay={80}
        />

        {/* Collector Friction */}
        <MetricCard
          label="Orders Abandoned"
          value={`${abandonmentRate}%`}
          sub="Orders abandoned at checkout"
          badge={
            abandonmentRate > 20
              ? { text: "Review", variant: "rose" }
              : undefined
          }
          delay={160}
        />

        {/* Supply Friction */}
        <MetricCard
          label="Order Ghost Rate"
          value={`${ghostRate}%`}
          sub="Orders Auto-declined due to no response"
          badge={
            ghostRate > 10 ? { text: "Warning", variant: "rose" } : undefined
          }
          delay={240}
        />
      </div>

      {/* ── Attrition & Friction Breakdown ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Friction Sources (BarList) */}
        <SectionPanel
          title="Friction Sources (Lost Orders)"
          delay={320}
          className="min-h-[380px]"
        >
          {frictionData.length > 0 ? (
            <BarList
              data={frictionData}
              className="mt-4 text-fluid-xxs"
              color="violet"
              showAnimation
            />
          ) : (
            <div className="h-56">
              <EmptyChart label="No operational friction detected" />
            </div>
          )}
        </SectionPanel>

        {/* Total Attrition Distribution (Donut) */}
        <SectionPanel
          title="Order Loss Distribution"
          delay={400}
          className="min-h-[380px] flex flex-col"
        >
          {donutData.length > 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center pt-4">
              <div className="relative w-56 h-56 overflow-visible">
                <div className="absolute z-10 inset-0 overflow-visible">
                  <DonutChart
                    data={donutData}
                    category="amount"
                    index="name"
                    colors={["blue", "violet", "teal"]}
                    className="h-full w-full overflow-visible"
                    showLabel={false}
                    showAnimation
                    customTooltip={DonTip}
                  />
                </div>
                <div className="absolute z-0 inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <p className="text-[9px] text-[#B0B8C1] uppercase tracking-[0.2em]">
                    Total Lost
                  </p>
                  <p className="font-serif text-3xl text-[#0E1B2E] mt-1">
                    {totalLost}
                  </p>
                </div>
              </div>

              {/* Dynamic Legend */}
              <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-8">
                {donutData.map((p, i) => {
                  const dotColors = [
                    "bg-blue-400",
                    "bg-violet-400",
                    "bg-teal-400",
                  ];
                  return (
                    <div key={p.name} className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${dotColors[i % dotColors.length]}`}
                      />
                      <span className="text-[10px] tracking-[0.1em] uppercase text-[#8A96A3]">
                        {p.name}
                      </span>
                      <span className="font-serif text-sm text-[#3A4A5C] ml-1">
                        {p.amount}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex-1">
              <EmptyChart label="No attrition data available" />
            </div>
          )}
        </SectionPanel>
      </div>

      {/* Tremor safelist constraints */}
      <div className="hidden bg-blue-500 bg-violet-500 bg-teal-500 fill-blue-500 fill-violet-500 fill-teal-500 bg-blue-400 bg-violet-400 bg-teal-400 text-amber-500 text-rose-500 bg-amber-50 bg-rose-50 border-amber-200 border-rose-200" />
    </div>
  );
}
