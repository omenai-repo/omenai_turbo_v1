import { strictRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { CombinedConfig, SessionData } from "@omenai/shared-types";
import { NextResponse } from "next/server";
import { getCoreFinancials } from "@omenai/shared-lib/analytics/getCoreFinancials";
import { getFinancialChartData } from "@omenai/shared-lib/analytics/getFinancialChartData";
import { handleErrorEdgeCases } from "../../../../../custom/errors/handler/errorHandler";
import { createErrorRollbarReport } from "../../../util";

const config: CombinedConfig = {
  ...strictRateLimit,
  allowedRoles: ["admin"],
  allowedAdminAccessRoles: ["Owner", "Admin"],
};

export const GET = withRateLimitHighlightAndCsrf(config)(async function GET(
  request: Request,
) {
  try {
    await connectMongoDB();
    // 1. Extract the year from the query parameters, defaulting to the current year
    const { searchParams } = new URL(request.url);
    const year =
      searchParams.get("year") || new Date().getFullYear().toString();

    // 2. Fire both aggregation pipelines simultaneously
    const [coreResponse, chartResponse] = await Promise.all([
      getCoreFinancials(),
      getFinancialChartData(year),
    ]);

    if (!coreResponse?.success || !chartResponse?.success) {
      return NextResponse.json(
        { success: false, message: "Failed to aggregate financial data" },
        { status: 500 },
      );
    }

    const { health, funnel } = coreResponse.data;
    const yearlyTrend = chartResponse.data;

    // 3. Shape the data specifically for the 2x2 Tremor Chart Grid
    const formattedData = {
      // Top Level KPIs (To sit right above the grid)
      kpis: {
        realizedGMV: health.realizedGMV,
        // We can sum the net revenue dynamically from the chart data for the selected year
        netPlatformRevenue: yearlyTrend?.reduce(
          (acc: number, curr: any) => acc + curr.netRevenue,
          0,
        ),
        trueAOV: Math.round(health.trueAOV ?? 0),
      },

      // Grid Chart 1: The 12-Month Performance (AreaChart / LineChart)
      trendChart: yearlyTrend,

      // Grid Chart 2: The Revenue Pipeline & Leakage (DonutChart)
      // Filtering out 0 values so the Donut chart renders cleanly
      funnelChart: [
        { name: "Pending (Potential)", value: funnel.potentialRevenue },
        { name: "Lost (Sticker Shock)", value: funnel.abandonedRevenue },
        { name: "Lost (Gallery Ghosted)", value: funnel.ghostedRevenue },
      ].filter((item) => item.value > 0),

      // Grid Chart 3: Liabilities & Logistics (BarList or BarChart)
      liabilitiesChart: [
        { name: "Tax Remittance Held", value: health.taxLiability },
        {
          name: "Avg Shipping Cost",
          value: Math.round(health.averageShipping),
        },
      ],
    };

    return NextResponse.json({ success: true, data: formattedData });
  } catch (error: any) {
    const error_response = handleErrorEdgeCases(error);

    // Log the failure to Rollbar for backend monitoring
    createErrorRollbarReport(
      "admin metrics: fetch financial data",
      error,
      error_response.status,
    );

    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status },
    );
  }
});
