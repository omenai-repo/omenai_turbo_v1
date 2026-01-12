import { ResponsiveLine } from "@nivo/line";
import Dropdown from "../../../components/Dropdown";
import { SalesTooltip } from "./Tooltip";

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
    <div className="h-[450px] rounded-2xl bg-white p-6 shadow-sm w-full">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-fluid-base font-medium">Sales Activity</h3>
          <p className="text-fluid-xxs text-neutral-500">
            Annual revenue performance
          </p>
        </div>
        <Dropdown />
      </div>
      <ResponsiveLine
        key={year}
        data={data}
        margin={{ top: 10, right: 70, bottom: 90, left: 70 }}
        xScale={{ type: "point" }}
        yScale={{
          type: "linear",
          min: "auto",
          max: "auto",
          stacked: false,
        }}
        yFormat=" >-$0,.0f"
        /* AXES — CLEAN & QUIET */
        axisTop={null}
        axisRight={null}
        axisBottom={{
          tickSize: 0,
          tickPadding: 14,
          legend: "Month",
          legendOffset: 42,
          legendPosition: "middle",
          format: (value) => value.substring(0, 3),
        }}
        axisLeft={{
          tickSize: 0,
          tickPadding: 14,
          legendOffset: -46,
          legendPosition: "middle",
          tickValues: yTicks,
          format: (v) => `$${v.toLocaleString()}`,
        }}
        /* GRID — SUBTLE */
        enableGridX={false}
        enableGridY={true}
        gridYValues={yTicks}
        /* VISUAL STYLE */
        curve="monotoneX"
        colors={["#0f172a"]}
        lineWidth={0.7}
        /* AREA */
        enableArea={true}
        areaOpacity={0.8}
        areaBaselineValue={minYValue}
        defs={[
          {
            id: "areaGradient",
            type: "linearGradient",
            colors: [
              { offset: 0, color: "#0f172a", opacity: 0.18 },
              { offset: 60, color: "#0f172a", opacity: 0.08 },
              { offset: 100, color: "#0f172a", opacity: 0.02 },
            ],
          },
        ]}
        fill={[{ match: "*", id: "areaGradient" }]}
        /* POINTS — HIDDEN (HOVER ONLY) */
        enablePoints={false}
        useMesh={true}
        enableCrosshair={true}
        crosshairType="x"
        tooltip={({ point }) => <SalesTooltip point={point} />}
        theme={{
          text: {
            fill: "#475569",
            fontSize: 12,
          },
          grid: {
            line: {
              stroke: "#e5e7eb",
              strokeDasharray: "3 6",
            },
          },
        }}
        motionConfig="gentle"
      />
    </div>
  );
};
