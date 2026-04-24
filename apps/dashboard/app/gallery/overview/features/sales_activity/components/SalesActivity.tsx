import { AreaChart, Card, Title, Text, Flex } from "@tremor/react";
import Dropdown from "../../../components/Dropdown";

// Helper to convert Nivo's nested data structure to Tremor's flat structure
const formatDataForTremor = (
  nivoData: { id: string; data: { x: string; y: number }[] }[],
) => {
  if (!nivoData || nivoData.length === 0) return [];

  const tremorDataMap = new Map<string, any>();

  nivoData.forEach((serie) => {
    serie.data.forEach((point) => {
      if (!tremorDataMap.has(point.x)) {
        tremorDataMap.set(point.x, { month: point.x });
      }
      const existing = tremorDataMap.get(point.x);
      existing[serie.id] = point.y;
    });
  });

  return Array.from(tremorDataMap.values());
};

// Custom Tooltip with a Dark Theme
const DarkTremorTooltip = ({ payload, active, label }: any) => {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="rounded-sm -lg border border-neutral-800 bg-neutral-950/95 p-4 shadow-xl backdrop-blur-sm">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-400">
        {label}
      </p>
      <div className="space-y-2">
        {payload.map((category: any, index: number) => (
          <div
            key={index}
            className="flex items-center justify-between space-x-10"
          >
            <div className="flex items-center space-x-2">
              <span
                className="h-2.5 w-2.5 rounded-sm -full"
                style={{ backgroundColor: category.color }}
              />
              <p className="text-sm font-medium text-neutral-300">
                {category.dataKey}
              </p>
            </div>
            <p className="text-sm font-bold text-white">
              ${category.value.toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export const SalesActivityChart = ({
  data,
  year,
}: {
  data: { id: string; data: { x: string; y: number }[] }[];
  year: string;
}) => {
  const chartData = formatDataForTremor(data);
  const categories = data.map((serie) => serie.id);

  return (
    <Card className="h-[450px] w-full rounded-sm  bg-white p-6 shadow-sm border border-neutral-100">
      <Flex justifyContent="between" alignItems="center">
        <div>
          <Title className="text-md font-semibold text-neutral-900">
            Sales Activity
          </Title>
          <Text className="text-xs text-neutral-500">
            Annual revenue performance for {year}
          </Text>
        </div>
        <Dropdown />
      </Flex>

      <div className="mt-6 h-72">
        <AreaChart
          key={year}
          data={chartData}
          index="month"
          categories={categories}
          colors={["indigo", "cyan", "fuchsia", "emerald", "amber"]}
          valueFormatter={(number) =>
            `$${Intl.NumberFormat("us").format(number).toString()}`
          }
          showAnimation={true}
          curveType="monotone"
          showGridLines={false}
          showLegend={false}
          showYAxis={false} // Hiding Y-axis makes it even cleaner, rely on tooltip
          // Applied the new dark tooltip
          customTooltip={DarkTremorTooltip}
          className="text-sm font-medium text-neutral-400"
        />
      </div>
    </Card>
  );
};
