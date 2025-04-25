import { create } from "zustand";

type ArtistActionStoreTypes = {
  artist_sidebar: boolean;
  toggle_artist_sidebar: () => void;
  sales_activity_year: string;
  set_sales_activity_year: (year: string) => void;
};

const now = new Date();

export const artistActionStore = create<ArtistActionStoreTypes>((set, get) => ({
  artist_sidebar: false,
  toggle_artist_sidebar: () => {
    const current_state = get().artist_sidebar;
    set({ artist_sidebar: !current_state });
  },
  sales_activity_year: now.getFullYear().toString(),
  set_sales_activity_year: (year: string) => {
    set({ sales_activity_year: year });
  },
}));
