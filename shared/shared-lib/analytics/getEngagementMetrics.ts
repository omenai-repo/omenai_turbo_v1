import { PriceRequest } from "@omenai/shared-models/models/artworks/ArtworkPriceRequestSchema";
import { RecentView } from "@omenai/shared-models/models/artworks/RecentlyViewed";

export async function getEngagementMetrics() {
  try {
    // Set up a 12-month rolling window for our trend charts
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
    twelveMonthsAgo.setDate(1); // Start at the beginning of that month
    twelveMonthsAgo.setHours(0, 0, 0, 0);

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

      // E. 12-MONTH TRENDS: PRICE REQUESTS
      PriceRequest.aggregate([
        { $match: { request_date: { $gte: twelveMonthsAgo } } },
        {
          $group: {
            _id: {
              month: { $month: "$request_date" },
              year: { $year: "$request_date" },
            },
            count: { $sum: 1 },
          },
        },
      ]),

      // F. 12-MONTH TRENDS: ARTWORK VIEWS
      RecentView.aggregate([
        { $match: { createdAt: { $gte: twelveMonthsAgo } } },
        {
          $group: {
            _id: {
              month: { $month: "$createdAt" },
              year: { $year: "$createdAt" },
            },
            count: { $sum: 1 },
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

    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const formattedTrends = [];

    // Build the perfect 12-month contiguous array
    for (let i = 11; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const m = d.getMonth() + 1; // 1-12
      const y = d.getFullYear();

      const requestsThisMonth =
        monthlyRequests.find((t: any) => t._id.month === m && t._id.year === y)
          ?.count || 0;
      const viewsThisMonth =
        monthlyViews.find((t: any) => t._id.month === m && t._id.year === y)
          ?.count || 0;

      formattedTrends.push({
        date: `${monthNames[m - 1]} ${y.toString().slice(-2)}`, // e.g., "Jan 26"
        "Price Requests": requestsThisMonth,
        "Artwork Views": viewsThisMonth,
      });
    }

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
        trends: formattedTrends,
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
