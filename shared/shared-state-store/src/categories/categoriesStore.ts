import { ArtworkSchemaTypes } from "@omenai/shared-types";
import { create } from "zustand";

type categoriesStoreTypes = {
  artworks: ArtworkSchemaTypes[];
  setArtworks: (artworks: any[]) => void;

  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  currentPage: number;
  setCurrentPage: (count: number) => void;
  paginationLoading: boolean;
  setPaginationLoading: (paginationLoading: boolean) => void;
  pageCount: number;
  setPageCount: (count: number) => void;
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
  currentPage: 1,
  setCurrentPage: (count: number) => {
    set({ currentPage: count });
  },
  paginationLoading: true,
  setPaginationLoading: (paginationLoading: boolean) => {
    set({ paginationLoading: paginationLoading });
  },
  pageCount: 1,
  setPageCount: (count: number) => {
    set({ pageCount: count });
  },
}));
