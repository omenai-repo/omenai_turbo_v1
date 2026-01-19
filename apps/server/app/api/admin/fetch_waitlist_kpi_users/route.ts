import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import WaitlistLead from "@omenai/shared-models/models/WaitlistFunnel/WaitlistLeadModel";

export async function POST(req: NextRequest) {
  try {
    await connectMongoDB();
    const { entity, filters, page = 1, limit = 50 } = await req.json();

    // 1. Build the Match Query (For the User List)
    const matchQuery: any = { entity };

    // Apply active filters to the user list search
    if (filters) {
      if (filters.buying_frequency)
        matchQuery["kpi.buying_frequency"] = filters.buying_frequency;
      if (filters.formal_education)
        matchQuery["kpi.formal_education"] = filters.formal_education;
      if (filters.source) matchQuery["marketing.source"] = filters.source;
      if (filters.country) matchQuery["country"] = filters.country;
    }

    const skip = (page - 1) * limit;

    // 2. THE DUAL-PIPELINE STRATEGY
    // Pipeline A: Get the filtered users (Pagination)
    // Pipeline B: Get the available filter options (Aggregated from ALL users of this entity)

    const [users, totalCount, filterOptions] = await Promise.all([
      // A. Fetch Users
      WaitlistLead.find(matchQuery)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("-__v"),

      // B. Count Total (for Pagination)
      WaitlistLead.countDocuments(matchQuery),

      // C. Aggregate Dynamic Filter Options (Facets)
      // We query strictly by 'entity' here to show ALL possibilities for this tab,
      // regardless of current selection (standard e-commerce filter behavior).
      WaitlistLead.aggregate([
        { $match: { entity } },
        {
          $facet: {
            // Get all unique Sources with counts
            sources: [
              { $group: { _id: "$marketing.source", count: { $sum: 1 } } },
              { $sort: { count: -1 } },
            ],
            // Get all unique Countries
            countries: [
              { $group: { _id: "$country", count: { $sum: 1 } } },
              { $sort: { count: -1 } },
            ],
            // Dynamic KPIs based on Entity
            kpi_primary: [
              {
                $group: {
                  _id:
                    entity === "collector"
                      ? "$kpi.buying_frequency"
                      : "$kpi.formal_education",
                  count: { $sum: 1 },
                },
              },
              { $sort: { count: -1 } },
            ],
            kpi_secondary: [
              {
                $group: {
                  _id:
                    entity === "collector"
                      ? "$kpi.collector_type"
                      : "$kpi.years_of_practice",
                  count: { $sum: 1 },
                },
              },
              { $sort: { count: -1 } },
            ],
          },
        },
      ]),
    ]);

    // 3. Clean up the Facet Result
    const facets = filterOptions[0];

    return NextResponse.json({
      success: true,
      users,
      pagination: {
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
        current: page,
      },
      // Return the dynamic lists for the frontend to render
      facets: {
        sources: facets.sources.map((s: any) => ({
          label: s._id || "Direct",
          count: s.count,
          value: s._id,
        })),
        countries: facets.countries.map((c: any) => ({
          label: c._id || "Unknown",
          count: c.count,
          value: c._id,
        })),
        primary_kpi: facets.kpi_primary.map((k: any) => ({
          label: k._id || "Not Specified",
          count: k.count,
          value: k._id,
        })),
        secondary_kpi: facets.kpi_secondary.map((k: any) => ({
          label: k._id || "Not Specified",
          count: k.count,
          value: k._id,
        })),
      },
    });
  } catch (error) {
    console.error("Search Error", error);
    return NextResponse.json(
      { success: false, error: "Search failed" },
      { status: 500 },
    );
  }
}
