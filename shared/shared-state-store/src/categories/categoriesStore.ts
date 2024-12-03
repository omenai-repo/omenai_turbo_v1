import { create } from "zustand";

type categoriesStoreTypes = {
  artworks: any[];
  setArtworks: (artworks: any[]) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  paginationCount: number;
  setPaginationCount: (count: number) => void;
  paginationLoading: boolean,
  setPaginationLoading: (paginationLoading: boolean) => void,
  pageCount: number,
  setPageCount: (count: number) => void
};
export const categoriesStore = create<categoriesStoreTypes>((set, get) => ({
  artworks: [],
  setArtworks: (artworks: any[]) => {
    set({ artworks });
  },
  isLoading: false,
  setIsLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },
  paginationCount: 1,
  setPaginationCount: (count: number) => {
    set({ paginationCount: count });
  },
  paginationLoading: true,
  setPaginationLoading: (paginationLoading: boolean) => {
    set({paginationLoading: paginationLoading})
  },
  pageCount: 1,
  setPageCount: (count: number) => {
    set({pageCount: count})
  }
}));
