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
  const fileData = editorial_storage.getFilePreview(
    process.env.NEXT_PUBLIC_APPWRITE_EDITORIAL_BUCKET_ID!,
    fileId,

    width ? width : 0, // width, ignored when 0
    height ? height : 0, // height, ignored when 0
    appwrite_image_gravity.Center, // crop center
    90, // slight compression
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
