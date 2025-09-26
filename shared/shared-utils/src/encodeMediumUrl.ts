import { ArtworkMediumTypes } from "@omenai/shared-types";

const createSlug = (medium: ArtworkMediumTypes): string => {
  return medium
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Replace spaces with hyphens
    .replace(/[()]/g, '')           // Remove parentheses
    .replace(/\//g, '-')            // Replace forward slashes with hyphens
    .replace(/-+/g, '-')            // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, '');         // Remove leading/trailing hyphens
};

// Medium to Slug mapping (for encoding medium names to URLs)
const mediumToSlug: Record<ArtworkMediumTypes, string> = {
  'Photography': 'photography',
  'Works on paper': 'works-on-paper',
  'Acrylic on canvas/linen/panel': 'acrylic-on-canvas-linen-panel',
  'Mixed media on paper/canvas': 'mixed-media-on-paper-canvas',
  'Sculpture (Resin/plaster/clay)': 'sculpture-resin-plaster-clay',
  'Oil on canvas/panel': 'oil-on-canvas-panel',
  'Sculpture (Bronze/stone/metal)': 'sculpture-bronze-stone-metal'
};

// Helper functions for encoding/decoding
export const encodeMediumForUrl = (medium: ArtworkMediumTypes): string => {
  return mediumToSlug[medium] || createSlug(medium);
};