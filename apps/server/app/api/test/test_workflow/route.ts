import { NextResponse } from "next/server";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { createWorkflow } from "@omenai/shared-lib/workflow_runs/createWorkflow";

import { ServerError } from "../../../../custom/errors/dictionary/errorDictionary";

import { mockInvoice } from "./p";
import { toUTCDate } from "@omenai/shared-utils/src/toUtcDate";

export async function POST() {
  try {
    const workflowID = await createWorkflow(
      "/api/workflows/emails/sendPaymentInvoice",
      `send_payment_invoice_${mockInvoice.invoiceNumber}_workflow`,
      JSON.stringify({
        invoice: mockInvoice,
      })
    );
    if (!workflowID) throw new ServerError("Workflow failed");

    return NextResponse.json(
      { message: "Workflow started", workflowID },
      { status: 200 }
    );
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);
    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status }
    );
  }
}
