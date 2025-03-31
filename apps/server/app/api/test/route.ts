import { updateNexusTracking } from "./../../../../../node_modules/@omenai/shared-lib/nexus_calc/nexus_tracking_update_calulations";
import { NextResponse } from "next/server";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { handleErrorEdgeCases } from "../../../custom/errors/handler/errorHandler";
import { nexus_thresholds } from "@omenai/shared-json/src/us_nexus_states_threshold";
import { US_NEXUS_THRESHOLD_LIST } from "@omenai/shared-types";
import { NexusTransactions } from "@omenai/shared-models/models/transactions/NexusModelSchema";
export async function POST(request: Request) {
  try {
    await connectMongoDB();

    // Insert only if state doesn't already exist
    // const operations = nexus_thresholds.map(
    //   (nexus: US_NEXUS_THRESHOLD_LIST) => ({
    //     updateOne: {
    //       filter: { state: nexus.state },
    //       update: { $setOnInsert: nexus },
    //       upsert: true, // Inserts only if it doesn't exist
    //     },
    //   })
    // );

    // const result = await NexusTransactions.bulkWrite(operations);
    // console.log(`Inserted: ${result.upsertedCount} new documents`);

    await updateNexusTracking("AK", 95000, 1);
    return NextResponse.json(
      {
        message: "Nexus data updated successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);
    console.log(error);
    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status }
    );
  }
}
