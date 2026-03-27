import { SalesActivity } from "@omenai/shared-models/models/sales/SalesActivity";

// Define a map to easily sort the string-based months chronologically later
const MONTH_ORDER: Record<string, number> = {
  January: 1,
  February: 2,
  March: 3,
  April: 4,
  May: 5,
  June: 6,
  July: 7,
  August: 8,
  September: 9,
  October: 10,
  November: 11,
  December: 12,
};

export async function getFinancialChartData(year: string) {
  try {
    const rawChartData = await SalesActivity.aggregate([
      // 1. Filter out everything except the requested year
      { $match: { year: year } },

      // 2. Bridge to the PurchaseTransaction collection
      {
        $lookup: {
          from: "purchasetransactions", // IMPORTANT: Verify this matches your actual DB collection name (usually lowercase plural of the model)
          localField: "trans_ref",
          foreignField: "trans_reference",
          as: "transactionData",
        },
      },

      // 3. Flatten the array so we can access trans_pricing easily
      { $unwind: "$transactionData" },

      // 4. Group by Month and sum the GMV and Commission
      {
        $group: {
          _id: "$month",
          monthlyGMV: { $sum: "$transactionData.trans_pricing.unit_price" },
          monthlyNet: { $sum: "$transactionData.trans_pricing.commission" },
        },
      },
    ]);

    // 5. Format and Sort Chronologically
    // MongoDB group outputs in random order, so we map it cleanly for the UI
    const formattedData = rawChartData
      .map((item) => ({
        month: item._id,
        gmv: item.monthlyGMV,
        netRevenue: item.monthlyNet,
        // Add a hidden sorting key based on our dictionary
        _sortKey: MONTH_ORDER[item._id] || 99,
      }))
      .sort((a, b) => a._sortKey - b._sortKey)
      // Strip out the sort key before sending to the frontend
      .map(({ _sortKey, ...rest }) => rest);

    return {
      success: true,
      data: formattedData,
    };
  } catch (error) {
    console.error(
      `[Financials API] Failed to fetch chart data for ${year}:`,
      error,
    );
    return { success: false, data: null };
  }
}
