import {
  appwrite_image_format,
  appwrite_image_gravity,
  promotional_storage,
} from "@omenai/appwrite-config/appwrite";

export const getPromotionalFileView = (
  fileId: string,
  width: number,
  height?: number
) => {
  const fileData = promotional_storage.getFilePreview(
    process.env.NEXT_PUBLIC_APPWRITE_PROMOTIONAL_BUCKET_ID!,
    fileId,
    width, // width, will be resized using this value.
    height ? height : 0, // height, ignored when 0
    appwrite_image_gravity.Center, // crop center
    100, // slight compression
    0, // border width
    "FFFFFF", // border color
    0, // border radius
    1, // full opacity
    0, // no rotation
    "FFFFFF", // background color
    appwrite_image_format.Webp
  );

  return fileData;
};
