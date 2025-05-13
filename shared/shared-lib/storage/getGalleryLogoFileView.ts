import {
  appwrite_image_format,
  appwrite_image_gravity,
  logo_storage,
} from "@omenai/appwrite-config/appwrite";

export const getGalleryLogoFileView = (
  fileId: string,
  width: number,
  height?: number
) => {
  const fileData = logo_storage.getFileView(
    process.env.NEXT_PUBLIC_APPWRITE_LOGO_BUCKET_ID!,
    fileId
  );

  return fileData;
};
