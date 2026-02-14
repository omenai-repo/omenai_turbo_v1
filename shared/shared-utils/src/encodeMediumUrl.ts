import { ArtworkMediumTypes } from "@omenai/shared-types";

const createSlug = (medium: ArtworkMediumTypes): string => {
  return medium
    .toLowerCase()
    .trim()
    .replaceAll(/\s+/g, "-") // replaceAll spaces with hyphens
    .replaceAll(/[()]/g, "") // Remove parentheses
    .replaceAll(/\//g, "-") // replaceAll forward slashes with hyphens
    .replaceAll(/-+/g, "-") // replaceAll multiple hyphens with single hyphen
    .replaceAll(/^-|-$/g, ""); // Remove leading/trailing hyphens
};

// Medium to Slug mapping (for encoding medium names to URLs)
const mediumToSlug: Record<ArtworkMediumTypes, string> = {
  Photography: "photography",
  "Works on paper": "works-on-paper",
  "Acrylic on canvas/linen/panel": "acrylic-on-canvas-linen-panel",
  "Mixed media on paper/canvas": "mixed-media-on-paper-canvas",
  "Oil on canvas/panel": "oil-on-canvas-panel",
};

// Helper functions for encoding/decoding
export const encodeMediumForUrl = (medium: ArtworkMediumTypes): string => {
  return mediumToSlug[medium] || createSlug(medium);
};
