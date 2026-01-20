import { ResponsiveBar } from "@nivo/bar";
import { formatSurveyText } from "../../../../utils/surveyConstants";

export const ChallengeBar = ({ data }: { data: any[] }) => {
  const chartData = data.map((d) => ({
    id: formatSurveyText(d._id),
    value: d.count,
  }));

  return (
    <ResponsiveBar
      data={chartData}
      keys={["value"]}
      indexBy="id"
      layout="horizontal" // 👈 Easier to read long labels
      margin={{ top: 10, right: 30, bottom: 50, left: 250 }}
      padding={0.3}
      colors={{ scheme: "category10" }}
      borderRadius={4}
      enableGridX={true}
      enableGridY={false}
      axisLeft={{
        tickSize: 0,
        tickPadding: 10,
        tickRotation: 0,
        legend: "",
        legendPosition: "middle",
        legendOffset: -40,
      }}
      labelSkipWidth={12}
      labelTextColor={{ from: "color", modifiers: [["darker", 2]] }}
    />
  );
};
