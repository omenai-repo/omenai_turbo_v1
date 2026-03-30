import { PriceRequest } from "@omenai/shared-models/models/artworks/ArtworkPriceRequestSchema";
import { RecentView } from "@omenai/shared-models/models/artworks/RecentlyViewed";

export async function getEngagementMetrics() {
  try {
    const [
      funnelStats,
      totalViews,
      topRequested,
      topViewed,
      monthlyRequests,
      monthlyViews,
    ] = await Promise.all([
      // A. THE POR LIQUIDITY FUNNEL
      PriceRequest.aggregate([
        {
          $group: {
            _id: null,
            totalRequests: { $sum: 1 },
            ordersPlaced: {
              $sum: { $cond: ["$funnel_status.is_order_placed", 1, 0] },
            },
            ordersPaid: {
              $sum: { $cond: ["$funnel_status.is_order_paid", 1, 0] },
            },
          },
        },
      ]),

      // B. TOTAL ARTWORK VIEWS
      RecentView.countDocuments(),

      // C. TOP 5 REQUESTED ARTWORKS (High Intent)
      PriceRequest.aggregate([
        {
          $group: {
            _id: "$art_id",
            count: { $sum: 1 },
            title: { $first: "$artwork_snapshot.title" },
            artist: { $first: "$artwork_snapshot.artist" },
            url: { $first: "$artwork_snapshot.url" },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ]),

      // D. TOP 5 VIEWED ARTWORKS (Market Attention)
      RecentView.aggregate([
        {
          $group: {
            _id: "$art_id",
            count: { $sum: 1 },
            title: { $first: "$artwork" }, // Assuming 'artwork' holds the title string based on your schema
            artist: { $first: "$artist" },
            url: { $first: "$url" },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ]),

      // E. ALL-TIME TRENDS: PRICE REQUESTS & UNIQUE COLLECTORS
      PriceRequest.aggregate([
        {
          $group: {
            _id: {
              year: { $year: "$request_date" },
              month: { $month: "$request_date" },
            },
            requests: { $sum: 1 },
            uniqueBuyers: { $addToSet: "$buyer_id" }, // Gathers an array of unique user IDs
          },
        },
        {
          $project: {
            requests: 1,
            uniqueCollectors: { $size: "$uniqueBuyers" }, // Counts the unique IDs
          },
        },
      ]),

      // F. ALL-TIME TRENDS: ARTWORK VIEWS
      RecentView.aggregate([
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            views: { $sum: 1 },
          },
        },
      ]),
    ]);

    // --- DATA FORMATTING & EXTRACTION ---

    // Safely extract funnel counts
    const funnel = funnelStats[0] || {
      totalRequests: 0,
      ordersPlaced: 0,
      ordersPaid: 0,
    };

    // Calculate conversion percentages safely
    const calcRate = (part: number, whole: number) =>
      whole > 0 ? Number(((part / whole) * 100).toFixed(1)) : 0;

    const rawTrends: any[] = [];

    // Combine the grouped data into a clean, flat array for the frontend
    monthlyRequests.forEach((req: any) => {
      rawTrends.push({
        year: req._id.year,
        month: req._id.month,
        requests: req.requests,
        uniqueCollectors: req.uniqueCollectors,
        views:
          monthlyViews.find(
            (v: any) =>
              v._id.year === req._id.year && v._id.month === req._id.month,
          )?.views || 0,
      });
    });

    // Catch any months that had views but NO requests
    monthlyViews.forEach((view: any) => {
      const exists = rawTrends.some(
        (t) => t.year === view._id.year && t.month === view._id.month,
      );
      if (!exists) {
        rawTrends.push({
          year: view._id.year,
          month: view._id.month,
          requests: 0,
          uniqueCollectors: 0,
          views: view.views,
        });
      }
    });

    return {
      success: true,
      data: {
        summary: {
          totalViews,
          totalRequests: funnel.totalRequests,
        },
        funnel: {
          requests: funnel.totalRequests,
          ordersPlaced: funnel.ordersPlaced,
          ordersPaid: funnel.ordersPaid,
          rates: {
            requestToOrder: calcRate(funnel.ordersPlaced, funnel.totalRequests),
            orderToPaid: calcRate(funnel.ordersPaid, funnel.ordersPlaced),
            totalLiquidity: calcRate(funnel.ordersPaid, funnel.totalRequests),
          },
        },
        trends: rawTrends, // Passing the all-time flat array to the frontend
        leaderboards: {
          topRequested,
          topViewed,
        },
      },
    };
  } catch (error) {
    console.error("[Engagement Metrics API] Failed to aggregate:", error);
    return { success: false, data: null };
  }
}
