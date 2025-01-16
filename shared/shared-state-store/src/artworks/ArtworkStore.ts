import { ArtworkSchemaTypes } from "@omenai/shared-types";
import { create } from "zustand";

type ArtworkStoreTypes = {
  artworks: ArtworkSchemaTypes[];
  setArtworks: (art_data: ArtworkSchemaTypes[]) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  pageCount: number;
  setPageCount: (count: number) => void;
};
export const artworkStore = create<ArtworkStoreTypes>((set, get) => ({
  artworks: [],
  setArtworks: (art_data: any[]) => {
    set({ artworks: art_data });
  },
  isLoading: false,
  setIsLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },
  pageCount: 1,
  setPageCount: (count: number) => {
    set({ pageCount: count });
  },
}));
