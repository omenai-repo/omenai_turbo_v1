import { create } from "zustand";

type ArtworkActionStoreTypes = {
  selectedTab: { title: string; tag: string };
  setSelectedTab: (tab: { title: string; tag: string }) => void;
  paginationCount: number;
  updatePaginationCount: (type: "dec" | "inc" | "reset") => void;
};
export const artworkActionStore = create<ArtworkActionStoreTypes>(
  (set, get) => ({
    selectedTab: { title: "Recently uploaded", tag: "recent" },
    setSelectedTab: (tab: { title: string; tag: string }) => {
      set({ selectedTab: tab });
    },
    paginationCount: 1,
    updatePaginationCount: (type: "dec" | "inc" | "reset") => {
      const currentPage = get().paginationCount;

      if (type === "dec" && currentPage === 1) {
        return;
      }
      if (type === "inc") set({ paginationCount: currentPage + 1 });
      if (type === "dec") set({ paginationCount: currentPage - 1 });
      if (type === "reset") set({ paginationCount: 1 });
    },
  })
);
