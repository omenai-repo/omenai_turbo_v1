import { ResponsiveLine } from "@nivo/line";

// make sure parent container have a defined height when using
// responsive component, otherwise height will be 0 and
// no chart will be rendered.
// website examples showcase many properties,
// you'll often use just a few of them.

// Calculate Y-axis ticks dynamically based on min and max values
function calculateYTicks(min: number, max: number, maxTicks = 6) {
  // Handle case where min and/or max is 0
  if (min === 0 && max === 0) {
    return []; // No data to show
  }

  // If only one of min or max is 0, set it to a small value to avoid division by 0
  if (min === 0 && max > 0) {
    min = 1; // Ensure a small starting value
  }

  if (max === 0 && min > 0) {
    max = min; // Set max equal to min to avoid invalid range
  }

  const range = max - min;
  const step = Math.round(range / maxTicks);

  const ticks = [];

  // Calculate the ticks based on the step, rounding to the nearest thousand
  for (let i = Math.floor(min / 1000) * 1000; i <= max; i += step) {
    ticks.push(Math.round(i / 1000) * 1000); // Round to nearest thousand
  }

  // Ensure that we don't exceed maxTicks
  if (ticks.length > maxTicks) {
    ticks.length = maxTicks;
  }

  return ticks;
}

export const SalesActivityChart = ({
  data /* see data tab */,
  year,
}: {
  data: { id: string; data: { x: string; y: number }[] }[];
  year: string;
}) => {
  const allYValues = data.flatMap((serie) => serie.data.map((item) => item.y));
  const minYValue = Math.min(...allYValues);
  const maxYValue = Math.max(...allYValues);

  // Calculate Y-axis ticks
  const yTicks = calculateYTicks(minYValue, maxYValue);
  return (
    <ResponsiveLine
      key={year}
      data={data}
      margin={{ top: 50, right: 40, bottom: 50, left: 60 }}
      xScale={{ type: "point" }}
      yScale={{
        type: "linear",
        min: "auto",
        max: "auto",
        stacked: false,
      }}
      yFormat=" >-$0,.1~f"
      axisTop={null}
      axisRight={null}
      axisBottom={{
        tickSize: 0,
        tickPadding: 12,
        tickRotation: 0,
        legend: "Month",
        legendOffset: 36,
        legendPosition: "middle",
        format: (value) => value.substring(0, 3), // prettier month labels
      }}
      axisLeft={{
        tickSize: 0,
        tickPadding: 12,
        tickRotation: 0,
        legend: "Revenue ($)",
        legendOffset: -50,
        legendPosition: "middle",
        tickValues: yTicks,
        format: (v) => `$${v.toLocaleString()}`,
      }}
      enableGridX={false}
      enableGridY={true}
      gridYValues={yTicks}
      theme={{
        text: {
          fill: "#0f172a", // slate-300
        },
        grid: {
          line: {
            stroke: "#0f172a", // slate-800
            strokeDasharray: "4 6",
          },
        },
        tooltip: {
          container: {
            background: "#0f172a", // slate-900
            color: "white",
            fontSize: "12px",
            borderRadius: "8px",
            padding: "10px 12px",
            boxShadow: "0 4px 14px rgba(0,0,0,0.4)",
          },
        },
      }}
      curve="cardinal"
      colors={["#0f172a"]}
      lineWidth={0.6}
      enableArea={true}
      areaOpacity={0.15}
      areaBaselineValue={minYValue}
      defs={[
        {
          id: "gradientLine",
          type: "linearGradient",
          colors: [
            { offset: 0, color: "#c7c7c7" }, // purple-500
            { offset: 100, color: "#c7c7c7" }, // purple-700
          ],
        },
      ]}
      fill={[{ match: "*", id: "gradientLine" }]}
      motionConfig="gentle"
      useMesh={true}
      enableCrosshair={true}
      crosshairType="bottom-left"
      pointSize={8}
      pointBorderWidth={2}
      pointColor="#0f172a"
      pointBorderColor="#c7c7c7"
      pointLabelYOffset={-12}
      pointLabel="data.yFormatted"
    />
  );
};
