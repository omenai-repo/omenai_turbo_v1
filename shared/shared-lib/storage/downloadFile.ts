import { storage } from "@omenai/appwrite-config/appwrite";

const bucketId: string =
  process.env.NEXT_PUBLIC_APPWRITE_DOCUMENTATION_BUCKET_ID ||
  (process.env.APPWRITE_DOCUMENTATION_BUCKET_ID as string);

export const downloadFile = async (fileId: string) => {
  const fileData = storage.getFileDownload({
    bucketId,
    fileId,
  });

  return fileData;
};

const invoiceBucketId =
  process.env.APPWRITE_INVOICE_BUCKET_ID ||
  process.env.NEXT_PUBLIC_APPWRITE_INVOICE_BUCKET_ID!;
export const downloadInvoiceFile = (file: string) => {
  if (!file) return;
  const fileDownload = storage.getFileDownload({
    bucketId: invoiceBucketId,
    fileId: file,
  });
  return fileDownload;
};
