import { formatSurveyText } from "../../../../utils/surveyConstants";
import { ResponsiveRadar } from "@nivo/radar";

export const SurveyRadar = ({ data }: { data: any[] }) => {
  if (!data || data.length === 0) return null;

  // Transform for Nivo
  const chartData = data.map((d) => ({
    driver: formatSurveyText(d._id),
    count: d.count,
  }));

  return (
    <div className="h-full w-full">
      <ResponsiveRadar
        data={chartData}
        keys={["count"]}
        indexBy="driver"
        maxValue="auto"
        margin={{ top: 70, right: 200, bottom: 80, left: 120 }}
        curve="linearClosed"
        borderWidth={2}
        borderColor={{ from: "color" }}
        gridLevels={5}
        gridShape="circular"
        gridLabelOffset={24}
        enableDots={true}
        dotSize={10}
        dotColor={{ theme: "background" }}
        dotBorderWidth={2}
        colors={{ scheme: "nivo" }}
        fillOpacity={0.25}
        blendMode="multiply"
        animate={true}
        theme={{
          axis: { ticks: { text: { fontSize: 11, fill: "#64748b" } } },
        }}
      />
    </div>
  );
};
