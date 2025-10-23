import { NextResponse } from "next/server";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { createWorkflow } from "@omenai/shared-lib/workflow_runs/createWorkflow";

import { ServerError } from "../../../../custom/errors/dictionary/errorDictionary";
import { generateDigit } from "@omenai/shared-utils/src/generateToken";
import { NotificationPayload } from "@omenai/shared-types";

export async function POST() {
  try {
    const workflowID = await createWorkflow(
      "/api/workflows/shipment/create_shipment",
      `test_workflow${generateDigit(2)}`,
      JSON.stringify({ order_id: "3267301" })
    );
    if (!workflowID) throw new ServerError("Workflow failed");

    // const payload: NotificationPayload = {
    //   to: "ExponentPushToken[uWP6MPMoP2iBBY1DuIQB3P]",
    //   title: "New order request",
    //   body: "You have a new order requst!",
    //   data: {
    //     type: "orders",
    //     access_type: "artist",
    //     metadata: {
    //       orderId: "53053us5850",
    //     },
    //     userId: "6112636c-ec83-48f2-a7a8-d9f1c9e44b4c",
    //   },
    // };

    // const workflowID = await createWorkflow(
    //   "/api/workflows/notification/pushNotification",
    //   `notification_workflow${generateDigit(2)}`,
    //   JSON.stringify(payload)
    // );

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
