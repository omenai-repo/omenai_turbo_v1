import { ArtworkUploadStateTypes } from "@omenai/shared-types";
import { create } from "zustand";

type GalleryActionStore = {
  sales_activity_year: string;
  set_sales_activity_year: (year: string) => void;
};
const now = new Date();

export const galleryActionStore = create<GalleryActionStore>((set, get) => ({
  sales_activity_year: now.getFullYear().toString(),
  set_sales_activity_year: (year: string) => {
    set({ sales_activity_year: year });
  },
}));
