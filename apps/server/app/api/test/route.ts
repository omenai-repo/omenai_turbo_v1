import { NextResponse } from "next/server";
import { generateInvoicePdf } from "@omenai/shared-lib/invoice/generateInvoice";
import { mockInvoice } from "./test_workflow/p";

export async function GET() {
  const pdfBuffer = await generateInvoicePdf(mockInvoice);

  return NextResponse.json({
    message: "Successful",
    isTrue: !!pdfBuffer,
  });
}
