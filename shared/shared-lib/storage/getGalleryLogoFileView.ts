import {
  appwrite_image_format,
  appwrite_image_gravity,
  storage,
} from "@omenai/appwrite-config/appwrite";

export const getGalleryLogoFileView = (
  fileId: string,
  width: number,
  height?: number
) => {
  const fileData = storage.getFilePreview({
    bucketId:process.env.NEXT_PUBLIC_APPWRITE_LOGO_BUCKET_ID!,
    fileId,
    width, // width, will be resized using this value.
    height: height ? height : 0, // height, ignored when 0
    gravity:appwrite_image_gravity.Center, // crop center
    quality: 70, // slight compression
    output:appwrite_image_format.Webp
  }
  );

  return fileData;
};
