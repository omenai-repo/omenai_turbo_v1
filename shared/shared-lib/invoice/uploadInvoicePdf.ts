import { nodeAppwriteStorage } from "@omenai/appwrite-config";
import { ID } from "node-appwrite";

export async function uploadInvoicePdf({
  pdfBuffer,
  invoiceNumber,
}: {
  pdfBuffer: Buffer;
  invoiceNumber: string;
}) {
  const bucketId = process.env.APPWRITE_INVOICE_BUCKET_ID!;

  const file = new File([new Uint8Array(pdfBuffer)], `${invoiceNumber}.pdf`, {
    type: "application/pdf",
  });

  const uploaded = await nodeAppwriteStorage.createFile({
    bucketId,
    fileId: ID.unique(),
    file,
  });

  return {
    bucketId,
    fileId: uploaded.$id,
    filename: `${invoiceNumber}.pdf`,
  };
}
