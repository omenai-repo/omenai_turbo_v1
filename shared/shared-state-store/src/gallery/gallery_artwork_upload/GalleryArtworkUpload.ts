import { ArtworkUploadStateTypes } from "@omenai/shared-types";
import { create } from "zustand";

type ErrorFields = {
  artist: string;
  year: string;
  title: string;
  materials: string;
  width: string;
  height: string;
  price: string;
  depth?: string;
};
type GalleryArtworkUploadTypes = {
  image: File | null;
  setImage: (img: File | null) => void;
  artworkUploadData: ArtworkUploadStateTypes;
  updateArtworkUploadData: (label: string, value: string) => void;
  clearData: () => void;
  errorFields: ErrorFields;
  updateErrorField: (label: string, value: string) => void;
};

export const galleryArtworkUploadStore = create<GalleryArtworkUploadTypes>(
  (set, get) => ({
    image: null,
    setImage: (image: File | null) => set({ image }),
    artworkUploadData: {
      artist: "",
      year: 0,
      title: "",
      medium: "",
      rarity: "",
      materials: "",
      width: "",
      height: "",
      weight: "",
      price: 0,
      usd_price: 0,
      shouldShowPrice: "",
      depth: "",
      artist_birthyear: "",
      artist_country_origin: "",
      certificate_of_authenticity: "",
      artwork_description: "",
      framing: "",
      signature: "",
      currency: "",
    },
    updateArtworkUploadData: (label: string, value: string) => {
      const data: Record<string, any> = get().artworkUploadData;

      if (label in data) {
        const updatedData = { ...data, [label]: value };

        set({
          artworkUploadData: updatedData as ArtworkUploadStateTypes,
        });
      }
    },
    clearData: () => {
      set({
        artworkUploadData: {
          artist: "",
          year: 0,
          title: "",
          medium: "",
          rarity: "",
          materials: "",
          width: "",
          height: "",
          price: 0,
          usd_price: 0,
          weight: "",
          shouldShowPrice: "",
          depth: "",
          artist_birthyear: "",
          artist_country_origin: "",
          certificate_of_authenticity: "",
          artwork_description: "",
          framing: "",
          signature: "",
          currency: "",
        },
      });
      set({ image: null });
    },
    errorFields: {
      artist: "",
      year: "",
      title: "",
      materials: "",
      width: "",
      height: "",
      price: "",
      depth: "",
      weight: "",
      artist_birthyear: "",
      artwork_description: "",
    },
    updateErrorField: (label: string, value: string) => {
      const data: Record<string, any> = get().errorFields;

      if (label in data) {
        const updatedData = { ...data, [label]: value };

        set({
          errorFields: updatedData as ErrorFields,
        });
      }
    },
  })
);
