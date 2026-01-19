import { NextResponse } from "next/server";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import CampaignVisit from "@omenai/shared-models/models/WaitlistFunnel/CampaignVisitsModel";
import WaitlistLead from "@omenai/shared-models/models/WaitlistFunnel/WaitlistLeadModel";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectMongoDB();

    // 1. Run Aggregations in Parallel
    const [signupStats, visitStats] = await Promise.all([
      // A. SIGNUP DATA (Leads)
      WaitlistLead.aggregate([
        {
          $facet: {
            overview: [{ $group: { _id: null, count: { $sum: 1 } } }],
            entitySplit: [{ $group: { _id: "$entity", count: { $sum: 1 } } }],

            // Fix 1: Increased Limit to 20 for Global Heatmap
            geo_distribution: [
              { $group: { _id: "$country", count: { $sum: 1 } } },
              { $sort: { count: -1 } },
              { $limit: 20 },
            ],

            // Traffic Source for Signups (for the ROI merge)
            signup_sources: [
              { $group: { _id: "$marketing.source", count: { $sum: 1 } } },
            ],

            // ... (Keep your other deep dive facets here: artist_education, etc.) ...
            artist_education: [
              { $match: { entity: "artist" } },
              { $group: { _id: "$kpi.formal_education", count: { $sum: 1 } } },
            ],
            artist_experience: [
              { $match: { entity: "artist" } },
              { $group: { _id: "$kpi.years_of_practice", count: { $sum: 1 } } },
            ],
            collector_frequency: [
              { $match: { entity: "collector" } },
              { $group: { _id: "$kpi.buying_frequency", count: { $sum: 1 } } },
            ],
            collector_type: [
              { $match: { entity: "collector" } },
              { $group: { _id: "$kpi.collector_type", count: { $sum: 1 } } },
            ],
            recent_signups: [
              { $sort: { createdAt: -1 } },
              { $limit: 5 },
              {
                $project: {
                  name: 1,
                  entity: 1,
                  country: 1,
                  createdAt: 1,
                  "marketing.source": 1,
                },
              },
            ],
          },
        },
      ]),

      // B. VISIT DATA (Total Traffic per Source)
      CampaignVisit.aggregate([
        {
          $group: {
            _id: "$source",
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const data = signupStats[0];
    const totalVisits = visitStats.reduce((acc, curr) => acc + curr.count, 0);

    // Fix 3: Merge Visits + Signups into one ROI Dataset
    // We create a map of all unique sources found in both collections
    const sourceMap = new Map();

    // Add Visits
    visitStats.forEach((v: any) => {
      const source = v._id || "Direct";
      if (!sourceMap.has(source))
        sourceMap.set(source, { source, visits: 0, signups: 0 });
      sourceMap.get(source).visits = v.count;
    });

    // Add Signups
    data.signup_sources.forEach((s: any) => {
      const source = s._id || "Direct";
      if (!sourceMap.has(source))
        sourceMap.set(source, { source, visits: 0, signups: 0 });
      sourceMap.get(source).signups = s.count;
    });

    // Convert Map to Array and Sort by Visits
    const roiData = Array.from(sourceMap.values())
      .sort((a: any, b: any) => b.visits - a.visits)
      .slice(0, 10); // Top 10 Sources

    // Format Response
    const formattedStats = {
      overview: {
        leads: data.overview[0]?.count || 0,
        visits: totalVisits,
        conversion:
          totalVisits > 0
            ? (((data.overview[0]?.count || 0) / totalVisits) * 100).toFixed(1)
            : "0.0",
      },
      split: data.entitySplit,
      artists: {
        education: data.artist_education,
        experience: data.artist_experience,
      },
      collectors: {
        frequency: data.collector_frequency,
        type: data.collector_type,
      },
      geo: data.geo_distribution,

      // The New ROI Data Structure
      traffic: roiData,

      recent: data.recent_signups,
    };

    // 3. 🧠 RUN STRATEGY ENGINE
    const suggestions = generateStrategy(formattedStats);

    return NextResponse.json({
      success: true,
      stats: formattedStats,
      suggestions,
    });
  } catch (error) {
    console.error("Dashboard Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed" },
      { status: 500 },
    );
  }
}

// --------------------------------------------------------
// 🤖 THE LOGIC BRAIN
// --------------------------------------------------------
function generateStrategy(stats: any) {
  const suggestions = [];

  // Helper: Find count by ID in a list
  const getCount = (list: any[], key: string) =>
    list.find((x) => x._id === key)?.count || 0;
  const totalLeads = stats.overview.leads;

  // 1. WHALE ALERT (High Frequency Buyers)
  const frequentBuyers = getCount(stats.collectors.frequency, "frequently");
  if (frequentBuyers > 0) {
    suggestions.push({
      type: "success",
      title: "Whale Activity Detected",
      message: `You have ${frequentBuyers} users who buy art 'Frequently'. Prepare a VIP email sequence for them immediately.`,
    });
  }

  // 2. SUPPLY IMBALANCE
  const artistCount = getCount(stats.split, "artist");
  const collectorCount = getCount(stats.split, "collector");
  if (artistCount > collectorCount * 3 && totalLeads > 10) {
    suggestions.push({
      type: "warning",
      title: "Supply/Demand Imbalance",
      message: `You have 3x more Artists than Collectors. Pause artist acquisition and focus entirely on Collector marketing.`,
    });
  }

  // 3. LOW CONVERSION WARNING
  if (Number(stats.overview.conversion) < 1.5 && stats.overview.visits > 50) {
    suggestions.push({
      type: "warning",
      title: "Conversion Friction",
      message: `Conversion rate is low (${stats.overview.conversion}%). Users are dropping off. Review the Hero Section copy.`,
    });
  }

  // 4. EDUCATION GAP (Product Feature)
  const selfTaught = getCount(stats.artists.education, "self-taught");
  if (selfTaught > artistCount * 0.5) {
    suggestions.push({
      type: "insight",
      title: "Feature Opportunity",
      message: `Majority of artists are self-taught. Prioritize building 'Portfolio Best Practices' tooltips in the upload flow.`,
    });
  }

  // 5. GLOBAL TRAFFIC
  const topCountry = stats.geo[0];
  if (topCountry && topCountry._id !== "Nigeria" && topCountry.count > 20) {
    suggestions.push({
      type: "insight",
      title: "International Traction",
      message: `Significant volume from ${topCountry._id}. Ensure currency support for this region is active.`,
    });
  }

  return suggestions;
}
