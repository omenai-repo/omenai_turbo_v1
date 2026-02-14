import React from "react";
import { ResponsiveBar } from "@nivo/bar";

interface AcquisitionChartProps {
  data: Array<{ source: string; count: number }>;
}

export const AcquisitionChart = ({ data }: AcquisitionChartProps) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-400">
        Waiting for traffic...
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 h-96">
      <h4 className="text-gray-700 font-semibold mb-4">Top Traffic Sources</h4>
      <div className="h-72">
        <ResponsiveBar
          data={data}
          keys={["count"]}
          indexBy="source"
          margin={{ top: 10, right: 30, bottom: 50, left: 60 }}
          padding={0.3}
          valueScale={{ type: "linear" }}
          indexScale={{ type: "band", round: true }}
          colors={{ scheme: "category10" }}
          borderRadius={4}
          axisTop={null}
          axisRight={null}
          axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: "Source",
            legendPosition: "middle",
            legendOffset: 32,
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: "Visits",
            legendPosition: "middle",
            legendOffset: -40,
          }}
          labelSkipWidth={12}
          labelSkipHeight={12}
          labelTextColor={{ from: "color", modifiers: [["darker", 1.6]] }}
          role="application"
        />
      </div>
    </div>
  );
};
