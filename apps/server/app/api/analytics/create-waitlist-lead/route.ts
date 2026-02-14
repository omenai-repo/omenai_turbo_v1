import { NextResponse } from "next/server";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import WaitlistLead from "@omenai/shared-models/models/WaitlistFunnel/WaitlistLeadModel";
import {
  generateMockData,
  seedVisits,
} from "@omenai/shared-lib/mock/generateMockData";
import CampaignVisit from "@omenai/shared-models/models/WaitlistFunnel/CampaignVisitsModel";
export async function POST(req: Request) {
  try {
    await connectMongoDB();
    const mockData = generateMockData();
    const visits = seedVisits();
    await WaitlistLead.insertMany(mockData);
    await CampaignVisit.insertMany(visits);

    return NextResponse.json(
      { message: "Mock data generated successfully", count: mockData.length },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to generate mock data" },
      { status: 500 },
    );
  }
}
