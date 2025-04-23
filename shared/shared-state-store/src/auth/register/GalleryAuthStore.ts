import { AddressTypes, GallerySignupData } from "@omenai/shared-types";
import { ICity, IState } from "country-state-city";
import { create } from "zustand";

type GalleryAuthStoreTypes = {
  currentGallerySignupFormIndex: number;
  incrementCurrentGallerySignupFormIndex: () => void;
  decrementCurrentGallerySignupFormIndex: () => void;
  gallerySignupData: Omit<GallerySignupData, "address"> & AddressTypes;
  updateGallerySignupData: (label: string, value: string | File | null) => void;
  selectedCityList: ICity[];
  setSelectedCityList: (value: ICity[]) => void;
  selectedStateList: IState[];
  setSelectedStateList: (value: IState[]) => void;
  isLoading: boolean;
  setIsLoading: () => void;
  clearData: () => void;
  isFieldDirty: Record<
    | keyof Omit<GallerySignupData, "address">
    | keyof Omit<AddressTypes, "countryCode" | "stateCode">,
    boolean
  >;
  setIsFieldDirty: (key: keyof GallerySignupData, value: boolean) => void;
};
export const useGalleryAuthStore = create<GalleryAuthStoreTypes>(
  (set, get) => ({
    // FUNCTION TO TRACK FORM INPUT INDEX
    // This value keeps track of the current form input index value.
    // The index value is crucial for determining which form fields
    // are mounted on the DOM and displyed to the user.
    currentGallerySignupFormIndex: 0,

    // FUNCTION TO INCREMENT FORM INDEX VALUE
    // This function basically increases the value for current form input index value,
    // depending on the current index value, a new form input field is
    // mounted on the DOM and displayed to the user.
    incrementCurrentGallerySignupFormIndex: () => {
      const index = get().currentGallerySignupFormIndex;
      set({ currentGallerySignupFormIndex: index + 1 });
    },

    // FUNCTION TO DECREMENT FORM INDEX VALUE
    // This function basically decreases the value for current form input index,
    // depending on the current index value, a new form input field is mounted on the DOM and displayed to the user.
    decrementCurrentGallerySignupFormIndex: () => {
      const index = get().currentGallerySignupFormIndex;
      set({ currentGallerySignupFormIndex: index - 1 });
    },
    gallerySignupData: {
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
      admin: "",
      description: "",
      logo: null,
      phone: "",
    },

    // UPDATE SIGNUP FORM DATA ON INPUT CHANGE
    // please note: The form fields are mounted on the DOM separately
    // hence why we have an update function to update the object fields individually.
    updateGallerySignupData: (label: string, value: string | File | null) => {
      const data: Record<string, any> = get().gallerySignupData;

      if (label in data) {
        const updatedData = { ...data, [label]: value };

        set({
          gallerySignupData: updatedData as Omit<GallerySignupData, "address"> &
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
        gallerySignupData: {
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
          admin: "",
          description: "",
          logo: null,
          phone: "",
        },
        currentGallerySignupFormIndex: 0,
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
      admin: true,
      description: true,
      logo: true,
      phone: true,
    },
    setIsFieldDirty: (key: keyof GallerySignupData, value: boolean) => {
      set((state: any) => ({
        isFieldDirty: {
          ...state.isFieldDirty,
          [key]: value,
        },
      }));
    },
  })
);
