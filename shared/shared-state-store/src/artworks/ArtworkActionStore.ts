import { create } from "zustand";

type ArtworkActionStoreTypes = {
  selectedTab: { title: string; tag: string };
  setSelectedTab: (tab: { title: string; tag: string }) => void;
  currentPage: number;
  setCurrentPage: (pageNumber: number) => void;
};
export const artworkActionStore = create<ArtworkActionStoreTypes>(
  (set, get) => ({
    selectedTab: { title: "Recently uploaded", tag: "recent" },
    setSelectedTab: (tab: { title: string; tag: string }) => {
      set({ selectedTab: tab });
    },
    currentPage: 1,
    setCurrentPage: (pageNumber: number) => {
      set({ currentPage: pageNumber });
    },
  })
);
