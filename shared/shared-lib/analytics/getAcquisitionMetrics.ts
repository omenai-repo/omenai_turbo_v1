import { AccountIndividual } from "@omenai/shared-models/models/auth/IndividualSchema";
import WaitlistLead from "@omenai/shared-models/models/WaitlistFunnel/WaitlistLeadModel";
// IMPORT YOUR NEW MODELS (Adjust paths to match your folder structure)
import { CreateOrder } from "@omenai/shared-models/models/orders/CreateOrderSchema";
import { Subscriptions } from "@omenai/shared-models/models/subscriptions/SubscriptionSchema";
import { Artworkuploads } from "@omenai/shared-models/models/artworks/UploadArtworkSchema";

type FormattedData = { name: string; count: number };

function formatByRole(rawData: any[]) {
  const result: {
    user: FormattedData[];
    artist: FormattedData[];
    gallery: FormattedData[];
  } = { user: [], artist: [], gallery: [] };

  rawData.forEach((item) => {
    const role = (item._id?.role || "user") as keyof typeof result;
    const label = item._id?.label || "Unknown";

    if (result[role]) {
      result[role].push({ name: label, count: item.count });
    }
  });

  return result;
}

export async function getAcquisitionMetrics() {
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  const now = new Date();

  try {
    // Fire all massive queries in absolute parallel
    const [
      globalDemographics, // 0
      waitlistStats, // 1
      collectorsWhoPlacedOrder, // 2
      collectorsWhoPaid, // 3
      repeatBuyersAggr, // 4
      artistsWithArt, // 5
      artistsWithRecentArt, // 6
      artistsWhoSold, // 7
      activeSubs, // 8
      hardChurnSubs, // 9
      galleriesWhoSold, // 10
    ] = await Promise.all([
      // 0. TOTAL COMMUNITY & DEMOGRAPHICS
      AccountIndividual.aggregate([
        { $unionWith: { coll: "accountartists" } },
        { $unionWith: { coll: "accountgalleries" } },
        {
          $facet: {
            summary: [{ $group: { _id: "$role", count: { $sum: 1 } } }],
            byCountry: [
              {
                $match: { "registration_tracking.referrer": { $ne: "legacy" } },
              },
              {
                $group: {
                  _id: {
                    role: "$role",
                    label: "$registration_tracking.country",
                  },
                  count: { $sum: 1 },
                },
              },
              { $sort: { count: -1 } },
            ],
            byDevice: [
              {
                $match: { "registration_tracking.referrer": { $ne: "legacy" } },
              },
              {
                $group: {
                  _id: {
                    role: "$role",
                    label: "$registration_tracking.device_type",
                  },
                  count: { $sum: 1 },
                },
              },
              { $sort: { count: -1 } },
            ],
            byReferrer: [
              {
                $match: { "registration_tracking.referrer": { $ne: "legacy" } },
              },
              {
                $group: {
                  _id: {
                    role: "$role",
                    label: "$registration_tracking.referrer",
                  },
                  count: { $sum: 1 },
                },
              },
              { $sort: { count: -1 } },
            ],
          },
        },
      ]),

      // 1. WAITLIST CONVERSION
      WaitlistLead.aggregate([
        {
          $lookup: {
            from: "accountindividuals",
            localField: "email",
            foreignField: "email",
            as: "registered_collector",
          },
        },
        {
          $project: {
            isConverted: { $gt: [{ $size: "$registered_collector" }, 0] },
          },
        },
        {
          $group: {
            _id: null,
            totalLeads: { $sum: 1 },
            convertedLeads: { $sum: { $cond: ["$isConverted", 1, 0] } },
          },
        },
      ]),

      // 2-4. COLLECTOR ACTIVATION (Distinct IDs)
      CreateOrder.distinct("buyer_details.id"),
      CreateOrder.distinct("buyer_details.id", {
        "payment_information.status": "completed",
      }),
      CreateOrder.aggregate([
        { $match: { "payment_information.status": "completed" } },
        { $group: { _id: "$buyer_details.id", count: { $sum: 1 } } },
        { $match: { count: { $gte: 2 } } },
      ]),

      // 5-7. ARTIST ACTIVATION (Distinct IDs)
      Artworkuploads.distinct("author_id"),
      Artworkuploads.distinct("author_id", {
        createdAt: { $gte: ninetyDaysAgo },
      }),
      CreateOrder.distinct("seller_details.id", {
        "payment_information.status": "completed",
        seller_designation: "artist",
      }),

      // 8-10. GALLERY ACTIVATION (Distinct IDs)
      Subscriptions.distinct("customer.gallery_id", {
        expiry_date: { $gte: now },
      }),
      Subscriptions.distinct("customer.gallery_id", {
        expiry_date: { $lt: ninetyDaysAgo },
      }),
      CreateOrder.distinct("seller_details.id", {
        "payment_information.status": "completed",
        seller_designation: "gallery",
      }),
    ]);

    // Data Extraction
    const rawData = globalDemographics[0];
    const waitlist = waitlistStats[0] || { totalLeads: 0, convertedLeads: 0 };

    // Helper to get total counts from the summary facet
    const getCount = (role: string) =>
      rawData.summary.find((s: any) => s._id === role)?.count || 0;

    const totalCollectors = getCount("user");
    const totalArtists = getCount("artist");
    const totalGalleries = getCount("gallery");

    // Math Helper for Activation Percentages
    const calc = (count: number, total: number) => ({
      count,
      percentage: total > 0 ? Number(((count / total) * 100).toFixed(1)) : 0,
    });

    // Zero-Sale Churn Logic: Galleries expired > 90 days but NOT found in the 'galleriesWhoSold' array
    const zeroSaleChurnCount = hardChurnSubs.filter(
      (churnedId: string) => !galleriesWhoSold.includes(churnedId),
    ).length;

    return {
      success: true,
      data: {
        summary: {
          totalCollectors,
          totalArtists,
          totalGalleries,
        },
        demographics: {
          countries: formatByRole(rawData.byCountry),
          devices: formatByRole(rawData.byDevice),
          referrers: formatByRole(rawData.byReferrer),
        },
        waitlist: {
          total: waitlist.totalLeads,
          converted: waitlist.convertedLeads,
          conversionRate:
            waitlist.totalLeads > 0
              ? ((waitlist.convertedLeads / waitlist.totalLeads) * 100).toFixed(
                  2,
                )
              : "0.00",
        },
        // --- NEW NETWORK ACTIVATION METRICS ---
        activation: {
          collectors: {
            placedOrder: calc(collectorsWhoPlacedOrder.length, totalCollectors),
            paidOrder: calc(collectorsWhoPaid.length, totalCollectors),
            repeatBuyer: calc(repeatBuyersAggr.length, totalCollectors),
          },
          artists: {
            hasArtworks: calc(artistsWithArt.length, totalArtists),
            activeCatalog: calc(artistsWithRecentArt.length, totalArtists),
            hasSoldArt: calc(artistsWhoSold.length, totalArtists),
          },
          galleries: {
            activeSubscription: calc(activeSubs.length, totalGalleries),
            churnedHard: calc(hardChurnSubs.length, totalGalleries),
            hasSoldArt: calc(galleriesWhoSold.length, totalGalleries),
            zeroSaleChurn: calc(zeroSaleChurnCount, hardChurnSubs.length),
          },
        },
      },
    };
  } catch (error) {
    console.error(
      "[Dashboard Error] Failed to fetch network/acquisition metrics:",
      error,
    );
    return { success: false, data: null };
  }
}
