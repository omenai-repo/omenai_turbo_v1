import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import WaitlistLead from "@omenai/shared-models/models/WaitlistFunnel/WaitlistLeadModel";
import { PipelineStage } from "mongoose";

export async function POST(req: NextRequest) {
  try {
    await connectMongoDB();
    const { country, page = 1, limit = 50 } = await req.json();

    const skip = (page - 1) * limit;

    // Base Match: Only users with survey data
    const baseMatch: any = { survey: { $exists: true, $ne: null } };

    // Filter Match: Applied to everything EXCEPT the country dropdown itself
    // (We want the dropdown to always show ALL countries, even if one is selected)
    const filterMatch = { ...baseMatch };
    if (country) filterMatch["country"] = country;

    const pipeline = [
      {
        $facet: {
          // 1. DISTINCT COUNTRIES (Run on Base Match to get ALL options)
          distinct_countries: [
            { $match: baseMatch }, // 👈 Look at global data
            { $group: { _id: "$country", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
          ],

          // 2. GLOBAL STATS (Run on Filter Match)
          discovery_split: [
            { $match: filterMatch },
            {
              $group: {
                _id: {
                  answer: "$survey.art_discovery_or_share_method",
                  entity: "$entity",
                },
                count: { $sum: 1 },
              },
            },
            {
              $group: {
                _id: "$_id.answer",
                breakdown: {
                  $push: { entity: "$_id.entity", count: "$count" },
                },
                total: { $sum: "$count" },
              },
            },
            { $sort: { total: -1 } },
          ],
          challenges_global: [
            { $match: filterMatch },
            {
              $group: { _id: "$survey.current_challenges", count: { $sum: 1 } },
            },
            { $sort: { count: -1 } },
          ],
          value_drivers_global: [
            { $match: filterMatch },
            {
              $group: { _id: "$survey.app_value_drivers", count: { $sum: 1 } },
            },
            { $sort: { count: -1 } },
          ],

          // 3. RAW RESPONSES (Paginated & Filtered)
          raw_responses: [
            { $match: filterMatch },
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit },
            {
              $project: {
                name: 1,
                email: 1,
                entity: 1,
                country: 1,
                survey: 1,
                createdAt: 1,
              },
            },
          ],
          total_count: [{ $match: filterMatch }, { $count: "count" }],
        },
      },
    ];

    const results = await WaitlistLead.aggregate(pipeline as PipelineStage[]);

    const data = results[0] || {
      distinct_countries: [],
      discovery_split: [],
      challenges_global: [],
      value_drivers_global: [],
      raw_responses: [],
      total_count: [],
    };

    const totalDocs = data.total_count?.[0]?.count || 0;

    return NextResponse.json({
      success: true,
      stats: data,
      pagination: {
        total: totalDocs,
        pages: Math.ceil(totalDocs / limit),
        current: page,
        limit,
      },
    });
  } catch (error) {
    console.error("Survey Stats Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed" },
      { status: 500 },
    );
  }
}
