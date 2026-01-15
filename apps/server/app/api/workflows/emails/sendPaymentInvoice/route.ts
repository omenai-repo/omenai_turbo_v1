import { serve } from "@upstash/workflow/nextjs";
import { InvoiceTypes } from "@omenai/shared-types";
import { uploadInvoicePdf } from "@omenai/shared-lib/invoice/uploadInvoicePdf";
import { generateInvoicePdf } from "@omenai/shared-lib/invoice/generateInvoice";
import { sendPurchaseInvoice } from "@omenai/shared-emails/src/models/invoice/sendPurchaseInvoice";
import { rollbarServerInstance } from "@omenai/rollbar-config";
import { Invoice } from "@omenai/shared-models/models/invoice/InvoiceSchema";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { CreateOrder } from "@omenai/shared-models/models/orders/CreateOrderSchema";
import { PurchaseTransactions } from "@omenai/shared-models/models/transactions/PurchaseTransactionSchema";
type Payload = {
  invoice: Omit<InvoiceTypes, "storage" | "document_created" | "receipt_sent">;
};
export const { POST } = serve<Payload>(async (ctx) => {
  const { invoice } = ctx.requestPayload;

  const workflow_run = await ctx.run("send_invoice_workflow", async () => {
    try {
      await connectMongoDB();
      const dbInvoice = await Invoice.findOneAndUpdate(
        { invoiceNumber: invoice.invoiceNumber },
        { $setOnInsert: invoice },
        { upsert: true, new: true }
      );

      if (!dbInvoice) {
        throw new Error("Invoice upsert failed");
      }

      // Always generate PDF when needed (deterministic)
      const pdfBuffer = await generateInvoicePdf(invoice);

      if (!pdfBuffer || pdfBuffer.length === 0) {
        throw new Error("PDF generation failed");
      }

      // 1️⃣ Mark document created
      if (!dbInvoice.document_created) {
        await Invoice.updateOne(
          { invoiceNumber: dbInvoice.invoiceNumber, document_created: false },
          { $set: { document_created: true } }
        );
      }

      // 2️⃣ Upload PDF (only once)
      if (!dbInvoice.storage?.fileId) {
        const upload = await uploadInvoicePdf({
          pdfBuffer,
          invoiceNumber: dbInvoice.invoiceNumber,
        });

        await Invoice.updateOne(
          {
            invoiceNumber: dbInvoice.invoiceNumber,
            "storage.fileId": { $exists: false },
          },
          {
            $set: {
              storage: {
                provider: "appwrite",
                fileId: upload.fileId,
              },
            },
          }
        );
      }

      // 3️⃣ Send receipt (only once)
      if (!dbInvoice.receipt_sent) {
        const sent = await sendReceipt(
          pdfBuffer,
          dbInvoice.recipient.name,
          dbInvoice.recipient.email
        );

        if (!sent) {
          throw new Error("Failed to send invoice email");
        }

        await Invoice.updateOne(
          {
            invoiceNumber: dbInvoice.invoiceNumber,
            receipt_sent: false,
          },
          { $set: { receipt_sent: true } }
        );
      }

      await CreateOrder.updateOne(
        { order_id: invoice.orderId },
        {
          $set: {
            "payment_information.invoice_reference": invoice.invoiceNumber,
          },
        }
      );
      await PurchaseTransactions.updateOne({});
      return true;
    } catch (error) {
      rollbarServerInstance.error({
        context:
          "Error Encountered during pdf process - Send payment Invoice workflow",
        error,
      });
      throw error;
    }
  });
  return Boolean(workflow_run);
});

async function sendReceipt(pdfBuffer: any, name: string, email: string) {
  try {
    const { error } = await sendPurchaseInvoice({
      name,
      pdfBuffer,
      email,
    });

    return !error;
  } catch (error) {
    return false;
  }
}
