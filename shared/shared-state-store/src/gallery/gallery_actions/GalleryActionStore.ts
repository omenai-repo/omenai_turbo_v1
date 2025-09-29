import { AddressTypes, ArtworkUploadStateTypes } from "@omenai/shared-types";
import { create } from "zustand";

type GalleryActionStore = {
  sales_activity_year: string;
  set_sales_activity_year: (year: string) => void;
    addressModalPopup: boolean;
    updateAddressModalPopup: (value: boolean) => void;
    address_temp: AddressTypes;
    updateAddress: (key: keyof AddressTypes, value: string) => void;
    clearAddress: () => void;
      logoModalPopup: boolean;
  updateLogoModalPopup: (value: boolean) => void;
};
const now = new Date();

export const galleryActionStore = create<GalleryActionStore>((set, get) => ({
  sales_activity_year: now.getFullYear().toString(),
  set_sales_activity_year: (year: string) => {
    set({ sales_activity_year: year });
  },
  addressModalPopup: false,
  updateAddressModalPopup: (value: boolean) => {
    set({ addressModalPopup: value });
  },
  address_temp: {
    address_line: "",
    city: "",
    country: "",
    state: "",
    countryCode: "",
    stateCode: "",
    zip: "",
  },
  updateAddress: (key: keyof AddressTypes, value: string) => {
    const address_snapshot = get().address_temp;
    const updatedAddress = {
      ...address_snapshot,
      [key]: value,
    };
    set({ address_temp: updatedAddress });
  },
  clearAddress: () => {
    set({
      address_temp: {
        address_line: "",
        city: "",
        country: "",
        state: "",
        countryCode: "",
        stateCode: "",
        zip: "",
      },
    });
  },
    logoModalPopup: false,
  updateLogoModalPopup: (value: boolean) => {
    set({ logoModalPopup: value });
  },
}));
