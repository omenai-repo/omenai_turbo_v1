import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import WaitlistLead from "@omenai/shared-models/models/WaitlistFunnel/WaitlistLeadModel";
import { PipelineStage } from "mongoose";

export async function POST(req: NextRequest) {
  try {
    await connectMongoDB();
    const { country } = await req.json();

    // 1. Build Match Query (Global Filters)
    const matchStage: any = {
      // Ensure we only look at users who actually have survey data
      survey: { $exists: true, $ne: null },
    };

    if (country) {
      matchStage["country"] = country;
    }

    // 2. The Analysis Pipeline
    const pipeline = [
      { $match: matchStage },
      {
        $facet: {
          // A. DISCOVERY METHOD (Split by Entity)
          discovery_split: [
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

          // B. PAIN POINTS (Challenges)
          challenges_global: [
            {
              $group: { _id: "$survey.current_challenges", count: { $sum: 1 } },
            },
            { $sort: { count: -1 } },
          ],

          // C. VALUE DRIVERS (Radar Data)
          value_drivers_global: [
            {
              $group: { _id: "$survey.app_value_drivers", count: { $sum: 1 } },
            },
            { $sort: { count: -1 } },
          ],

          // D. RAW RESPONSES (The "Google Forms" List View)
          raw_responses: [
            { $sort: { createdAt: -1 } },
            { $limit: 100 }, // Limit for performance, paginate real list in separate API if needed
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
        },
      },
    ];

    const results = await WaitlistLead.aggregate(pipeline as PipelineStage[]);
    const data = results[0];

    // 3. Post-Processing for Business Logic
    // (We generate the "Suggestions" on the frontend to keep the API lean,
    // or here if we want centralized logic. Let's return raw stats for max UI flexibility.)

    return NextResponse.json({ success: true, stats: data });
  } catch (error) {
    console.error("Survey Stats Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to analyze survey" },
      { status: 500 },
    );
  }
}
