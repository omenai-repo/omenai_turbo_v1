import { Artworkuploads } from "@omenai/shared-models/models/artworks/UploadArtworkSchema";
import { AccountArtist } from "@omenai/shared-models/models/auth/ArtistSchema";
import { AccountGallery } from "@omenai/shared-models/models/auth/GallerySchema";
import { AccountIndividual } from "@omenai/shared-models/models/auth/IndividualSchema";
import { CreateOrder } from "@omenai/shared-models/models/orders/CreateOrderSchema";
import { PurchaseTransactions } from "@omenai/shared-models/models/transactions/PurchaseTransactionSchema";
import { SubscriptionTransactions } from "@omenai/shared-models/models/transactions/SubscriptionTransactionSchema";

export async function getFinancialAndHeroMetrics() {
  try {
    // 1. Run all independent queries in parallel for maximum speed
    const [
      totalCollectors,
      totalArtists,
      totalGalleries,
      totalLiveArtworks,
      totalOrders,
      financialAggregations,
      subscriptionRevenue,
    ] = await Promise.all([
      AccountIndividual.countDocuments(),
      AccountArtist.countDocuments(),
      AccountGallery.countDocuments({ gallery_verified: true }),
      Artworkuploads.countDocuments({ availability: true }),
      CreateOrder.countDocuments(),

      // --- THE FINANCIAL AGGREGATIONS ---
      // This calculates GMV and Net Platform Revenue in a single pass
      PurchaseTransactions.aggregate([
        {
          $match: { status: "successful" },
        },
        {
          $group: {
            _id: null,
            // True GMV: The actual value of the art (excludes shipping/taxes)
            true_gmv: { $sum: "$trans_pricing.unit_price" },
            // Net Revenue: Commission + any Exclusivity Penalty Fees
            net_revenue: {
              $sum: {
                $add: [
                  "$trans_pricing.commission",
                  { $ifNull: ["$trans_pricing.penalty_fee", 0] }, // Default to 0 if no penalty
                ],
              },
            },
            // Logistics Volume: Total money moving through for shipping
            total_shipping_volume: { $sum: "$trans_pricing.shipping_cost" },
          },
        },
      ]),

      // --- PLATFORM MRR (Subscription Revenue) ---
      SubscriptionTransactions.aggregate([
        { $match: { status: "successful" } },
        {
          $group: {
            _id: null,
            total_subscription_revenue: { $sum: "$amount" },
          },
        },
      ]),
    ]);

    // 2. Format and safely return the data
    // MongoDB aggregations return an array, so we safely extract the first item
    const financials = financialAggregations[0] || {
      true_gmv: 0,
      net_revenue: 0,
      total_shipping_volume: 0,
    };
    const subscriptions = subscriptionRevenue[0] || {
      total_subscription_revenue: 0,
    };

    return {
      success: true,
      data: {
        hero: {
          collectors: totalCollectors,
          artists: totalArtists,
          galleries: totalGalleries,
          liveArtworks: totalLiveArtworks,
          totalOrders: totalOrders,
        },
        financials: {
          gmv: financials.true_gmv,
          netRevenue: financials.net_revenue,
          shippingVolume: financials.total_shipping_volume,
          subscriptionRevenue: subscriptions.total_subscription_revenue,
        },
      },
    };
  } catch (error) {
    console.error("[Dashboard Error] Failed to fetch hero metrics:", error);
    return { success: false, data: null };
  }
}
