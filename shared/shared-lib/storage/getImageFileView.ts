import {
  appwrite_image_format,
  appwrite_image_gravity,
  storage,
} from "@omenai/appwrite-config/appwrite";

export const getImageFileView = (
  fileId: string,
  width: number,
  height?: number,
  format?: string
) => {
  const fileData = storage.getFileView(
    process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!,
    fileId
  );

  return fileData;
};
