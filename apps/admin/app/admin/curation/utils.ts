import { getEditorialFileView } from "@omenai/shared-lib/storage/getEditorialCoverFileView";
import {
  getOptimizedImage,
  getOptimizedLogoImage,
} from "@omenai/shared-lib/storage/getImageFileView";
import { getPromotionalOptimizedImage } from "@omenai/shared-lib/storage/getPromotionalsFileView";

export function resolveImageUrls(item: any, type: string) {
  if (!item) return "";

  switch (type) {
    case "artwork":
      return item.url ? getOptimizedImage(item.url, "small") : "";
    case "events":
      return item.cover_image
        ? getPromotionalOptimizedImage(item.cover_image, "small")
        : "";
    case "gallery":
      return item.logo ? getOptimizedLogoImage(item.logo, "small") : "";
    case "article":
      return item.cover ? getEditorialFileView(item.cover, 300) : "";
    case "promotionals":
      return item.image
        ? getPromotionalOptimizedImage(item.image, "small")
        : "";
    default:
      return "";
  }
}

export function resolveTitle(item: any): string {
  if (!item) return "Untitled";
  return item.title || item.headline || item.name || "Untitled";
}

export function resolveSubtitle(item: any, type: string): string {
  if (!item) return "";
  if (type === "artwork") return item.artist_name || item.medium || "";
  if (type === "gallery") return item.location || item.city || "";
  if (type === "events") return item.date || item.venue || "";
  if (type === "article") return item.author || item.category || "";
  return item.description?.slice(0, 48) || "";
}

export function resolveIdentifier(item: any, type: string): string {
  if (!item) return "";

  switch (type) {
    case "artwork":
      return item.art_id;
    case "gallery":
      return item.gallery_id;
    case "events":
      return item.event_id;
    case "article":
      return item.slug; // Assuming you are using slug, fallback to item.$id if Appwrite
    case "promotionals":
      return item._id; // Adjust to whatever your promo schema uses
    default:
      return item._id || item.id || "";
  }
}
