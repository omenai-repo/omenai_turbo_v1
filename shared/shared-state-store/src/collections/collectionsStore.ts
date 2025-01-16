import { ArtworkSchemaTypes } from "@omenai/shared-types";
import { create } from "zustand";

type collectionsStoreTypes = {
  artworks: ArtworkSchemaTypes[];
  setArtworks: (art_data: ArtworkSchemaTypes[]) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  currentPage: number;
  setCurrentPage: (count: number) => void;
  paginationLoading: boolean;
  setPaginationLoading: (paginationLoading: boolean) => void;
  pageCount: number;
  setPageCount: (count: number) => void;
};
export const collectionsStore = create<collectionsStoreTypes>((set, get) => ({
  artworks: [],
  setArtworks: (art_data: ArtworkSchemaTypes[]) => {
    set({ artworks: art_data });
  },
  isLoading: false,
  setIsLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },
  currentPage: 1,
  setCurrentPage: (count: number) => {
    set({ currentPage: count });
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
