import { AddressTypes, ArtistSignupData } from "@omenai/shared-types";
import { ICity, IState } from "country-state-city";
import { create } from "zustand";

type ArtistAuthStoreTypes = {
  currentArtistSignupFormIndex: number;
  incrementCurrentArtistSignupFormIndex: () => void;
  decrementCurrentArtistSignupFormIndex: () => void;
  artistSignupData: Omit<ArtistSignupData, "address"> & AddressTypes;
  updateArtistSignupData: (label: string, value: string | File | null) => void;
  selectedCityList: ICity[];
  setSelectedCityList: (value: ICity[]) => void;
  selectedStateList: IState[];
  setSelectedStateList: (value: IState[]) => void;
  isLoading: boolean;
  setIsLoading: () => void;
  clearData: () => void;
  isFieldDirty: Record<
    | keyof Omit<ArtistSignupData, "address" | "base_currency">
    | keyof Omit<AddressTypes, "countryCode" | "stateCode">,
    boolean
  >;
  setIsFieldDirty: (key: keyof ArtistSignupData, value: boolean) => void;
};
export const useArtistAuthStore = create<ArtistAuthStoreTypes>((set, get) => ({
  // FUNCTION TO TRACK FORM INPUT INDEX
  // This value keeps track of the current form input index value.
  // The index value is crucial for determining which form fields
  // are mounted on the DOM and displyed to the user.
  currentArtistSignupFormIndex: 0,

  // FUNCTION TO INCREMENT FORM INDEX VALUE
  // This function basically increases the value for current form input index value,
  // depending on the current index value, a new form input field is
  // mounted on the DOM and displayed to the user.
  incrementCurrentArtistSignupFormIndex: () => {
    const index = get().currentArtistSignupFormIndex;
    set({ currentArtistSignupFormIndex: index + 1 });
  },

  // FUNCTION TO DECREMENT FORM INDEX VALUE
  // This function basically decreases the value for current form input index,
  // depending on the current index value, a new form input field is mounted on the DOM and displayed to the user.
  decrementCurrentArtistSignupFormIndex: () => {
    const index = get().currentArtistSignupFormIndex;
    set({ currentArtistSignupFormIndex: index - 1 });
  },
  artistSignupData: {
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    address_line: "",
    city: "",
    country: "",
    countryCode: "",
    state: "",
    stateCode: "",
    zip: "",
    logo: null,
    art_style: "",
    base_currency: "",
  },

  // UPDATE SIGNUP FORM DATA ON INPUT CHANGE
  // please note: The form fields are mounted on the DOM separately
  // hence why we have an update function to update the object fields individually.
  updateArtistSignupData: (label: string, value: string | File | null) => {
    const data: Record<string, any> = get().artistSignupData;

    if (label in data) {
      const updatedData = { ...data, [label]: value };

      set({
        artistSignupData: updatedData as Omit<ArtistSignupData, "address"> &
          AddressTypes,
      });
    }
  },
  selectedCityList: [],
  setSelectedCityList: (value: ICity[]) => {
    set({ selectedCityList: value });
  },
  selectedStateList: [],
  setSelectedStateList: (value: IState[]) => {
    set({ selectedStateList: value });
  },
  isLoading: false,
  setIsLoading: () => {
    const loadingState = get().isLoading;

    set({ isLoading: !loadingState });
  },
  clearData: () => {
    set({
      artistSignupData: {
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        address_line: "",
        city: "",
        country: "",
        state: "",
        stateCode: "",
        zip: "",
        countryCode: "",
        art_style: "",
        logo: null,
        base_currency: "",
      },
      currentArtistSignupFormIndex: 0,
    });
  },

  isFieldDirty: {
    name: true,
    email: true,
    password: true,
    confirmPassword: true,
    address_line: true,
    city: true,
    country: true,
    state: true,
    zip: true,
    logo: true,
    art_style: true,
  },
  setIsFieldDirty: (key: keyof ArtistSignupData, value: boolean) => {
    set((state: any) => ({
      isFieldDirty: {
        ...state.isFieldDirty,
        [key]: value,
      },
    }));
  },
}));
