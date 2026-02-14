import { StrategySuggestion } from "@omenai/shared-hooks/hooks/useDashboardAnalytics";
import React from "react";
interface StrategyFeedProps {
  suggestions: StrategySuggestion[];
}

export const StrategyFeed: React.FC<StrategyFeedProps> = ({ suggestions }) => {
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-8">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        ⚡ Strategy Engine
      </h3>
      <div className="space-y-4">
        {suggestions.map((item, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg border-l-4 shadow-sm flex flex-col gap-1 ${
              item.type === "warning"
                ? "bg-red-50 border-red-500 text-red-900"
                : item.type === "success"
                  ? "bg-green-50 border-green-500 text-green-900"
                  : "bg-blue-50 border-blue-500 text-blue-900"
            }`}
          >
            <span className="font-bold text-sm uppercase opacity-80">
              {item.type === "insight" ? "Business Insight" : item.title}
            </span>
            <p className="text-sm font-medium leading-relaxed">
              {item.message}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
