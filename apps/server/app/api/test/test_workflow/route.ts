import { NextResponse } from "next/server";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { createWorkflow } from "@omenai/shared-lib/workflow_runs/createWorkflow";

import { ServerError } from "../../../../custom/errors/dictionary/errorDictionary";
import { generateDigit } from "@omenai/shared-utils/src/generateToken";

export async function POST() {
  try {
    const workflowID = await createWorkflow(
      "/api/workflows/shipment/create_shipment",
      `test_workflow${generateDigit(2)}`,
      JSON.stringify({ order_id: "1385265" })
    );
    if (!workflowID) throw new ServerError("Workflow failed");
    return NextResponse.json(
      { message: "Workflow started", workflowID },
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
