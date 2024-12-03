import { create } from "zustand";

type collectionsStoreTypes = {
  artworks: any[];
  setArtworks: (art_data: any[]) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  paginationCount: number;
  setPaginationCount: (count: number) => void;
  paginationLoading: boolean;
  setPaginationLoading: (paginationLoading: boolean) => void;
  pageCount: number;
  setPageCount: (count: number) => void;
};
export const collectionsStore = create<collectionsStoreTypes>((set, get) => ({
  artworks: [],
  setArtworks: (art_data: any[]) => {
    set({ artworks: art_data });
  },
  isLoading: false,
  setIsLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },
  paginationCount: 1,
  setPaginationCount: (count: number) => {
    set({ paginationCount: count });
  },
  paginationLoading: false,
  setPaginationLoading: (paginationLoading: boolean) => {
    set({ paginationLoading: paginationLoading });
  },
  pageCount: 1,
  setPageCount: (count: number) => {
    set({ pageCount: count });
  },
}));
