import React from "react";
import { ResponsivePie } from "@nivo/pie";

interface UserSplitChartProps {
  data: { artist: number; collector: number };
}

export const UserSplitChart: React.FC<UserSplitChartProps> = ({ data }) => {
  // Transform object to Nivo format
  const chartData = [
    {
      id: "Artists",
      label: "Artists",
      value: data.artist || 0,
      color: "hsl(220, 70%, 50%)",
    },
    {
      id: "Collectors",
      label: "Collectors",
      value: data.collector || 0,
      color: "hsl(45, 70%, 50%)",
    },
  ];

  if (data.artist === 0 && data.collector === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-400">
        No Data Yet
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 h-96">
      <h4 className="text-gray-700 font-semibold mb-4">Ecosystem Balance</h4>
      <div className="h-64">
        <ResponsivePie
          data={chartData}
          margin={{ top: 20, right: 80, bottom: 80, left: 80 }}
          innerRadius={0.5}
          padAngle={0.7}
          cornerRadius={3}
          activeOuterRadiusOffset={8}
          colors={{ scheme: "nivo" }} // Or use custom colors
          borderWidth={1}
          borderColor={{ from: "color", modifiers: [["darker", 0.2]] }}
          arcLinkLabelsSkipAngle={10}
          arcLinkLabelsTextColor="#333333"
          arcLinkLabelsThickness={2}
          arcLinkLabelsColor={{ from: "color" }}
          enableArcLabels={true}
          arcLabelsSkipAngle={10}
          arcLabelsTextColor={{ from: "color", modifiers: [["darker", 2]] }}
        />
      </div>
    </div>
  );
};
