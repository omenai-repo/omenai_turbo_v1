import { create } from "zustand";

type ArtistActionStoreTypes = {
  artist_sidebar: boolean;
  toggle_artist_sidebar: () => void;
};

export const artistActionStore = create<ArtistActionStoreTypes>((set, get) => ({
  artist_sidebar: false,
  toggle_artist_sidebar: () => {
    const current_state = get().artist_sidebar;
    set({ artist_sidebar: !current_state });
  },
}));
