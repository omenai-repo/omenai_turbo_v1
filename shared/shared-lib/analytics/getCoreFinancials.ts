import { CreateOrder } from "@omenai/shared-models/models/orders/CreateOrderSchema";
import { PurchaseTransactions } from "@omenai/shared-models/models/transactions/PurchaseTransactionSchema";

export async function getCoreFinancials() {
  try {
    const [ledgerData, pipelineData] = await Promise.all([
      // 1. THE LEDGER: Realized cash, taxes, and shipping
      PurchaseTransactions.aggregate([
        {
          $group: {
            _id: null,
            totalCompletedOrders: { $sum: 1 },
            realizedGMV: { $sum: "$trans_pricing.unit_price" },
            totalTaxCollected: { $sum: "$trans_pricing.tax_fees" },
            averageShippingCost: { $avg: "$trans_pricing.shipping_cost" },
          },
        },
      ]),

      // 2. THE PIPELINE: Pending, Abandoned, and Ghosted Revenue
      CreateOrder.aggregate([
        {
          $facet: {
            potentialRevenue: [
              { $match: { "order_accepted.status": "" } },
              {
                $group: {
                  _id: null,
                  totalValue: { $sum: "$artwork_data.pricing.usd_price" },
                },
              },
            ],
            abandonedRevenue: [
              {
                $match: {
                  "order_accepted.status": "declined",
                  "order_accepted.reason":
                    "The payment period for this artwork has expired.",
                },
              },
              {
                $group: {
                  _id: null,
                  totalValue: { $sum: "$artwork_data.pricing.usd_price" },
                },
              },
            ],
            ghostedRevenue: [
              {
                $match: {
                  "order_accepted.status": "declined",
                  "order_accepted.reason":
                    "Seller did not respond within the designated timeframe",
                },
              },
              {
                $group: {
                  _id: null,
                  totalValue: { $sum: "$artwork_data.pricing.usd_price" },
                },
              },
            ],
          },
        },
      ]),
    ]);

    // Safely extract ledger metrics
    const ledger = ledgerData[0] || {
      totalCompletedOrders: 0,
      realizedGMV: 0,
      totalTaxCollected: 0,
      averageShippingCost: 0,
    };

    // Safely extract pipeline metrics
    const pipeline = pipelineData[0] || {};
    const potential = pipeline.potentialRevenue?.[0]?.totalValue || 0;
    const abandoned = pipeline.abandonedRevenue?.[0]?.totalValue || 0;
    const ghosted = pipeline.ghostedRevenue?.[0]?.totalValue || 0;

    // Calculate True AOV (Only using completed orders)
    const trueAOV =
      ledger.totalCompletedOrders > 0
        ? ledger.realizedGMV / ledger.totalCompletedOrders
        : 0;

    return {
      success: true,
      data: {
        health: {
          realizedGMV: ledger.realizedGMV,
          trueAOV: trueAOV,
          taxLiability: ledger.totalTaxCollected,
          averageShipping: ledger.averageShippingCost,
        },
        funnel: {
          potentialRevenue: potential,
          abandonedRevenue: abandoned,
          ghostedRevenue: ghosted,
        },
      },
    };
  } catch (error) {
    console.error("[Financials API] Failed to fetch core financials:", error);
    return { success: false, data: { health: {}, funnel: {} } };
  }
}
