import { ArtworkUploadStateTypes } from "@omenai/shared-types";
import { create } from "zustand";

type ErrorFields = {
  artist: string;
  year: string;
  title: string;
  materials: string;
  height: string;
  price: string;
  width: string;
};
type GalleryArtworkUploadTypes = {
  image: File | null;
  setImage: (img: File | null) => void;
  artworkUploadData: ArtworkUploadStateTypes;
  updateArtworkUploadData: (label: string, value: any) => void;
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
      artist_id: "",
      newGhostArtistName: "",
      year: 0,
      title: "",
      medium: "",
      rarity: "",
      materials: "",
      height: "",
      weight: "",
      price: 0,
      usd_price: 0,
      shouldShowPrice: "Yes",
      width: "",
      artist_birthyear: "",
      artist_country_origin: "",
      certificate_of_authenticity: "",
      artwork_description: "",
      signature: "",
      currency: "",
      packaging_type: "rolled",
    },
    updateArtworkUploadData: (label: string, value: any) => {
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
          artist_id: "",
          newGhostArtistName: "",
          year: 0,
          title: "",
          medium: "",
          rarity: "",
          materials: "",
          height: "",
          price: 0,
          usd_price: 0,
          weight: "",
          shouldShowPrice: "",
          width: "",
          artist_birthyear: "",
          artist_country_origin: "",
          certificate_of_authenticity: "",
          artwork_description: "",
          signature: "",
          currency: "",
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
      price: "",
      width: "",
      weight: "",
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
