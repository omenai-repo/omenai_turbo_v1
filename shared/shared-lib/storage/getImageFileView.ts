import {
  appwrite_image_format,
  appwrite_image_gravity,
  storage,
} from "@omenai/appwrite-config/appwrite";

// Define quality presets for different use cases
const QUALITY_PRESETS = {
  thumbnail: 40,
  low: 50,
  medium: 70,
  high: 85,
  max: 90, // Even "max" shouldn't be 100
};

// Define size presets
const SIZE_PRESETS = {
  thumbnail: { width: 300 },
  small: { width: 500 },
  medium: { width: 800 },
  large: { width: 1200 },
  xlarge: { width: 1920 },
};

export const getImageFileView = (
  fileId: string,
  width: number,
  height?: number,
  quality: number = 70 // Default to 70 instead of 100
) => {
  const fileData = storage.getFilePreview({
    bucketId:process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!,
    fileId,
    width, // width, will be resized using this value.
    height: height|| 0, // height, ignored when 0
    gravity:appwrite_image_gravity.Center, // crop center
    quality, // slight compression
    output:appwrite_image_format.Webp
  }
  );

  return fileData;
};

// Convenience function with presets
export const getOptimizedImage = (
  fileId: string,
  preset: "thumbnail" | "small" | "medium" | "large" | "xlarge" = "small",
  customQuality?: number
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

  return getImageFileView(fileId, size.width, undefined, quality);
};

// For responsive images with different qualities based on context
export const getResponsiveImageSet = (fileId: string) => {
  return {
    placeholder: getImageFileView(fileId, 50, undefined, 30), // Tiny placeholder
    thumbnail: getImageFileView(fileId, 300, undefined, 60),
    small: getImageFileView(fileId, 500, undefined, 70),
    medium: getImageFileView(fileId, 800, undefined, 75),
    large: getImageFileView(fileId, 1200, undefined, 80),
  };
};
