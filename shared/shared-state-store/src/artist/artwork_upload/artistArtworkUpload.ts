import { ArtworkUploadStateTypes } from "@omenai/shared-types";
import { create } from "zustand";

type ErrorFields = {
  artist: string;
  year: string;
  title: string;
  materials: string;
  height: string;
  length: string;
};
type ArtistArtworkUploadTypes = {
  image: File | null;
  setImage: (img: File | null) => void;
  artworkUploadData: Omit<
    ArtworkUploadStateTypes,
    "price" | "usd_price" | "shouldShowPrice" | "currency"
  >;
  updateArtworkUploadData: (label: string, value: string) => void;
  clearData: () => void;
  errorFields: ErrorFields;
  updateErrorField: (label: string, value: string) => void;
};

export const artistArtworkUploadStore = create<ArtistArtworkUploadTypes>(
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
      height: "",
      weight: "",
      length: "",
      artist_birthyear: "",
      artist_country_origin: "",
      certificate_of_authenticity: "",
      artwork_description: "",
      signature: "",
      packaging_type: "rolled",
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
          height: "",
          weight: "",
          length: "",
          artist_birthyear: "",
          artist_country_origin: "",
          certificate_of_authenticity: "",
          artwork_description: "",
          signature: "",
          packaging_type: "rolled",
        },
      });
      set({ image: null });
    },
    errorFields: {
      artist: "",
      year: "",
      title: "",
      materials: "",
      height: "",
      length: "",
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
  }),
);
