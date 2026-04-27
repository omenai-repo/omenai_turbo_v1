export type CurationItem = {
  type: string;
  identifier: string;
  data?: any;
  isMissingData?: boolean;
};

export const LIBRARY_TABS = [
  { id: "artwork", label: "Artworks" },
  { id: "gallery", label: "Galleries" },
  { id: "events", label: "Events" },
  { id: "article", label: "Articles" },
  { id: "promotionals", label: "Promos" },
];

export const MAX_ITEMS = 30;
