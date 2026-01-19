import { ResponsiveBar } from "@nivo/bar";

export const DenseBarChart = ({
  data,
  colorScheme = "nivo",
}: {
  data: any[];
  colorScheme?: string;
}) => {
  // Normalize data for Nivo (It expects 'id' and 'value')
  const chartData = data.map((d) => ({
    id: d._id || "Unknown",
    value: d.count,
  }));

  if (chartData.length === 0)
    return (
      <div className="h-full flex items-center justify-center text-xs text-gray-400">
        No Data
      </div>
    );

  return (
    <ResponsiveBar
      data={chartData}
      keys={["value"]}
      indexBy="id"
      margin={{ top: 10, right: 10, bottom: 40, left: 40 }}
      padding={0.3}
      colors={{ scheme: colorScheme as any }}
      borderRadius={2}
      enableLabel={false} // Too dense for labels inside bars
      axisBottom={{ tickRotation: -25, tickSize: 0, tickPadding: 10 }} // Slanted for readability
      axisLeft={{ tickSize: 0, tickPadding: 10 }}
      gridYValues={4} // Minimal grid lines
      theme={{
        axis: { ticks: { text: { fontSize: 11, fill: "#888" } } },
        grid: { line: { stroke: "#f0f0f0" } },
      }}
      tooltip={({ id, value, color }) => (
        <div className="bg-white p-2 shadow-xl border border-gray-100 rounded text-xs">
          <strong style={{ color }}>{id}</strong>: {value}
        </div>
      )}
    />
  );
};
