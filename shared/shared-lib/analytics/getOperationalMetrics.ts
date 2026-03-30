import { CreateOrder } from "@omenai/shared-models/models/orders/CreateOrderSchema";

export async function getOperationalMetrics() {
  try {
    const pipelineData = await CreateOrder.aggregate([
      {
        $facet: {
          // 1. TIME-TO-QUOTE (Gallery Response Velocity)
          timeToQuote: [
            {
              // Changed: Match any order that was quoted, regardless of if the collector later abandoned it
              $match: {
                "order_accepted.acceptedAt": { $exists: true },
              },
            },
            {
              $project: {
                hoursToQuote: {
                  $dateDiff: {
                    startDate: "$createdAt",
                    endDate: "$order_accepted.acceptedAt",
                    unit: "hour",
                  },
                },
              },
            },
            { $group: { _id: null, averageHours: { $avg: "$hoursToQuote" } } },
          ],

          // 2. INVOICE ABANDONMENT RATE (Collector Sticker Shock)
          abandonment: [
            // Removed the $match trap entirely. We scan all documents.
            {
              $group: {
                _id: null,
                // The Denominator: Any order that is CURRENTLY accepted, OR was abandoned (which proves it was accepted at some point)
                totalQuotes: {
                  $sum: {
                    $cond: [
                      {
                        $or: [
                          { $eq: ["$order_accepted.status", "accepted"] },
                          {
                            $eq: [
                              "$order_accepted.reason",
                              "The payment period for this artwork has expired.",
                            ],
                          },
                        ],
                      },
                      1,
                      0,
                    ],
                  },
                },
                // The Numerator: Only the abandoned ones
                abandonedQuotes: {
                  $sum: {
                    $cond: [
                      {
                        $and: [
                          { $eq: ["$order_accepted.status", "declined"] },
                          {
                            $eq: [
                              "$order_accepted.reason",
                              "The payment period for this artwork has expired.",
                            ],
                          },
                        ],
                      },
                      1,
                      0,
                    ],
                  },
                },
              },
            },
          ],

          // 3 & 4. GHOST RATE & REJECTION RATE (Supply-Side Friction)
          galleryResponsiveness: [
            {
              $group: {
                _id: null,
                totalOrders: { $sum: 1 },

                ghostedOrders: {
                  $sum: {
                    $cond: [
                      {
                        $and: [
                          // FIXED: Using $order_accepted.status instead of $status
                          { $eq: ["$order_accepted.status", "declined"] },
                          {
                            $eq: [
                              "$order_accepted.reason",
                              "Seller did not respond within the designated timeframe",
                            ],
                          },
                        ],
                      },
                      1,
                      0,
                    ],
                  },
                },

                manuallyRejectedOrders: {
                  $sum: {
                    $cond: [
                      {
                        $and: [
                          // FIXED: Using $order_accepted.status instead of $status
                          { $eq: ["$order_accepted.status", "declined"] },
                          {
                            $ne: [
                              "$order_accepted.reason",
                              "Seller did not respond within the designated timeframe",
                            ],
                          },
                          {
                            $ne: [
                              "$order_accepted.reason",
                              "The payment period for this artwork has expired.",
                            ],
                          },
                        ],
                      },
                      1,
                      0,
                    ],
                  },
                },
              },
            },
          ],

          // 5. ACTIVE BOTTLENECKS (In Exhibition)
          activeBottlenecks: [
            {
              $match: {
                status: "processing", // Root status is correct here
                $or: [
                  { exhibition_status: { $ne: null } },
                  { "exhibition_status.status": { $ne: "pending" } },
                ],
                "shipping_details.shipment_information.tracking.id": null,
              },
            },
            { $count: "inExhibition" },
          ],
        },
      },
    ]);

    // Extracting the data safely
    const rawTime = pipelineData[0]?.timeToQuote[0]?.averageHours || 0;
    const abandonmentData = pipelineData[0]?.abandonment[0] || {
      totalQuotes: 0,
      abandonedQuotes: 0,
    };
    const responsivenessData = pipelineData[0]?.galleryResponsiveness[0] || {
      totalOrders: 0,
      ghostedOrders: 0,
      manuallyRejectedOrders: 0,
    };

    // Extract bottlenecks (Fallback to 0 if the array is empty)
    const bottlenecksData = pipelineData[0]?.activeBottlenecks[0] || {
      inExhibition: 0,
    };

    // Percentage Calculations
    const calcRate = (part: number, total: number) =>
      total > 0 ? parseFloat(((part / total) * 100).toFixed(1)) : 0;

    return {
      success: true,
      data: {
        timeToQuoteHours: Math.round(rawTime),
        abandonmentRate: calcRate(
          abandonmentData.abandonedQuotes,
          abandonmentData.totalQuotes,
        ),
        ghostRate: calcRate(
          responsivenessData.ghostedOrders,
          responsivenessData.totalOrders,
        ),
        rejectionRate: calcRate(
          responsivenessData.manuallyRejectedOrders,
          responsivenessData.totalOrders,
        ),
        totals: {
          abandoned: abandonmentData.abandonedQuotes,
          ghosted: responsivenessData.ghostedOrders,
          rejected: responsivenessData.manuallyRejectedOrders,
          totalOrders: responsivenessData.totalOrders,
        },
        activeBottlenecks: {
          inExhibition: bottlenecksData.inExhibition,
        },
      },
    };
  } catch (error) {
    console.error("[Metrics API] Failed to fetch operations metrics:", error);
    return { success: false, data: null };
  }
}
