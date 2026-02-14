import {
  appwrite_image_format,
  appwrite_image_gravity,
  storage,
} from "@omenai/appwrite-config/appwrite";
import {
  SIZE_PRESETS,
  QUALITY_PRESETS,
  getImageFileView,
} from "./getImageFileView";

export const getPromotionalFileView = (
  fileId: string,
  width: number,
  quality: number,
  height?: number
) => {
  const fileData = storage.getFilePreview({
    bucketId: process.env.NEXT_PUBLIC_APPWRITE_PROMOTIONAL_BUCKET_ID!,
    fileId,
    width, // width, will be resized using this value.
    height: height ? height : 0, // height, ignored when 0
    gravity: appwrite_image_gravity.Center, // crop center
    quality: 90, // slight compression
    output: appwrite_image_format.Webp,
  });

  return fileData;
};

// Convenience function with presets
export const getPromotionalOptimizedImage = (
  fileId: string,
  preset: "thumbnail" | "small" | "medium" | "large" | "xlarge" = "small",
  customQuality?: number,
  height?: number
) => {
  const size = SIZE_PRESETS[preset];

  // Use lower quality for smaller images
  const qualityMap = {
    thumbnail: QUALITY_PRESETS.thumbnail,
    small: QUALITY_PRESETS.low,
    medium: QUALITY_PRESETS.medium,
    large: QUALITY_PRESETS.high,
    xlarge: QUALITY_PRESETS.high,
  };

  const quality = customQuality || qualityMap[preset];

  return getPromotionalFileView(fileId, size.width, quality, height);
};
