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
      margin={{ top: 50, right: 60, bottom: 50, left: 60 }}
      xScale={{ type: "point" }}
      yScale={{
        type: "linear",
        min: "auto",
        max: "auto",
        stacked: true,
        reverse: false,
      }}
      yFormat=" >-$0,.1~f"
      axisTop={null}
      axisRight={null}
      axisBottom={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: "Month",
        legendOffset: 36,
        legendPosition: "middle",
        truncateTickAt: 0,
      }}
      axisLeft={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: "Revenue ($)",
        legendOffset: -50,
        legendPosition: "middle",
        truncateTickAt: 20,
        tickValues: yTicks, // Use the calculated ticks
      }}
      pointSize={10}
      pointColor={{ theme: "background" }}
      pointBorderWidth={2}
      pointBorderColor={{ from: "serieColor" }}
      pointLabel="data.yFormatted"
      pointLabelYOffset={-12}
      enableTouchCrosshair={true}
      useMesh={true}
      curve="cardinal"
      crosshairType="cross"
      enableGridX={true}
      enableGridY={false}
      motionConfig="gentle"
      colors={["#666666"]}
      lineWidth={1}
    />
  );
};
