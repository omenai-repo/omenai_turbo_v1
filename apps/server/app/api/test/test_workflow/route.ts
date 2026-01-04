import { NextResponse } from "next/server";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { createWorkflow } from "@omenai/shared-lib/workflow_runs/createWorkflow";

import { ServerError } from "../../../../custom/errors/dictionary/errorDictionary";

import { meta, paymentIntent } from "./p";

export async function POST() {
  try {
    const workflowID = await createWorkflow(
      "/api/workflows/payment/handleArtworkPaymentUpdateByStripe",
      `stripe_payment_workflow_${paymentIntent.id}`,
      JSON.stringify({
        provider: "stripe",
        meta,
        checkoutSession: paymentIntent,
      })
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
