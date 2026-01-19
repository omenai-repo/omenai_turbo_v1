import { DashboardStats } from "@omenai/shared-hooks/hooks/useDashboardAnalytics";
import React from "react";
interface MetricCardsProps {
  overview: DashboardStats["overview"];
}

export const MetricCards: React.FC<MetricCardsProps> = ({ overview }) => {
  // Guard clause to prevent crashing if data is still loading/undefined
  if (!overview) return null;

  const cards = [
    {
      label: "Total Waitlist",
      // API now returns 'leads', not 'totalLeads'
      value: overview.leads.toLocaleString(),
      subtext: "Confirmed Signups",
      color: "border-l-4 border-blue-600",
    },
    {
      label: "Total Visitors",
      // API now returns 'visits', not 'totalVisits'
      value: overview.visits.toLocaleString(),
      subtext: "Unique Sessions",
      color: "border-l-4 border-slate-400",
    },
    {
      label: "Conversion Rate",
      // API now returns 'conversion', not 'conversionRate'
      value: `${overview.conversion}%`,
      subtext: "Visit to Signup Ratio",
      color:
        overview.leads > 0 && Number(overview.conversion) < 1.5
          ? "border-l-4 border-red-500" // Red flag if conversion is critically low
          : "border-l-4 border-green-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className={`bg-white p-6 rounded-lg shadow-sm border border-slate-100 ${card.color}`}
        >
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">
            {card.label}
          </p>
          <h3 className="mt-2 text-3xl font-bold text-slate-900">
            {card.value}
          </h3>
          <p className="text-xs text-slate-400 mt-1">{card.subtext}</p>
        </div>
      ))}
    </div>
  );
};
