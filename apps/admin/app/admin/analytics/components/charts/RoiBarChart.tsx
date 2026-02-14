import { ResponsiveBar } from "@nivo/bar";

export const RoiBarChart = ({ data }: { data: any[] }) => {
  if (!data || data.length === 0)
    return (
      <div className="h-full flex items-center justify-center text-gray-400">
        No Traffic Data
      </div>
    );

  return (
    <ResponsiveBar
      data={data}
      keys={["visits", "signups"]} // 👈 The two bars
      indexBy="source"
      groupMode="grouped" // 👈 Places them side-by-side
      margin={{ top: 20, right: 130, bottom: 50, left: 60 }}
      padding={0.3}
      valueScale={{ type: "linear" }}
      indexScale={{ type: "band", round: true }}
      colors={["#cbd5e1", "#2563eb"]} // Grey for Visits, Blue for Signups
      borderRadius={2}
      axisTop={null}
      axisRight={null}
      axisBottom={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: "Marketing Source",
        legendPosition: "middle",
        legendOffset: 32,
      }}
      axisLeft={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: "Count",
        legendPosition: "middle",
        legendOffset: -40,
      }}
      labelSkipWidth={12}
      labelSkipHeight={12}
      labelTextColor={{ from: "color", modifiers: [["darker", 1.6]] }}
      legends={[
        {
          dataFrom: "keys",
          anchor: "bottom-right",
          direction: "column",
          justify: false,
          translateX: 120,
          translateY: 0,
          itemsSpacing: 2,
          itemWidth: 100,
          itemHeight: 20,
          itemDirection: "left-to-right",
          itemOpacity: 0.85,
          symbolSize: 20,
          effects: [
            {
              on: "hover",
              style: {
                itemOpacity: 1,
              },
            },
          ],
        },
      ]}
      tooltip={({ id, value, color, indexValue }) => (
        <div className="bg-white p-2 shadow-xl border border-gray-100 rounded text-xs z-50">
          <strong>{indexValue}</strong>
          <br />
          <span style={{ color }}>●</span> {id}: <strong>{value}</strong>
        </div>
      )}
    />
  );
};
