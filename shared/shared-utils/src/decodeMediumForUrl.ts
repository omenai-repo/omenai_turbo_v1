import { ArtworkMediumTypes } from "@omenai/shared-types";

// Slug to Medium mapping (for decoding URLs back to original medium names)
const slugToMedium: Record<string, ArtworkMediumTypes> = {
  photography: "Photography",
  "works-on-paper": "Works on paper",
  "acrylic-on-canvas-linen-panel": "Acrylic on canvas/linen/panel",
  "mixed-media-on-paper-canvas": "Mixed media on paper/canvas",
  "oil-on-canvas-panel": "Oil on canvas/panel",
};

export const decodeMediumFromUrl = (
  slug: string,
): ArtworkMediumTypes | null => {
  const normalizedSlug = slug.toLowerCase().trim();
  return slugToMedium[normalizedSlug] || null;
};
