import {
  appwrite_image_format,
  appwrite_image_gravity,
  editorial_storage,
} from "@omenai/appwrite-config/appwrite";

export const getEditorialCoverFileView = (
  fileId: string,
  width?: number,
  height?: number
) => {
  const fileData = editorial_storage.getFileView(
    process.env.NEXT_PUBLIC_APPWRITE_EDITORIAL_BUCKET_ID!,
    fileId
  );

  return fileData;
};
