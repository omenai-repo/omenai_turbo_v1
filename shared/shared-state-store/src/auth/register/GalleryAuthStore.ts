import { add } from "date-fns";
import { GallerySignupData } from "@omenai/shared-types";
import { create } from "zustand";

type GalleryAuthStoreTypes = {
  currentGallerySignupFormIndex: number;
  incrementCurrentGallerySignupFormIndex: () => void;
  decrementCurrentGallerySignupFormIndex: () => void;
  gallerySignupData: GallerySignupData;
  updateGallerySignupData: (label: string, value: string | File | null) => void;
  isLoading: boolean;
  setIsLoading: () => void;
  clearData: () => void;
  isFieldDirty: Record<keyof GallerySignupData, boolean>;
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
      address: "",
      admin: "",
      description: "",
      country: "",
      logo: null,
    },

    // UPDATE SIGNUP FORM DATA ON INPUT CHANGE
    // please note: The form fields are mounted on the DOM separately
    // hence why we have an update function to update the object fields individually.
    updateGallerySignupData: (label: string, value: string | File | null) => {
      const data: Record<string, any> = get().gallerySignupData;

      if (label in data) {
        const updatedData = { ...data, [label]: value };

        set({ gallerySignupData: updatedData as GallerySignupData });
      }
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
          address: "",
          admin: "",
          description: "",
          country: "",
          logo: null,
        },
        currentGallerySignupFormIndex: 0,
      });
    },

    isFieldDirty: {
      name: true,
      email: true,
      password: true,
      confirmPassword: true,
      address: true,
      admin: true,
      description: true,
      country: true,
      logo: true,
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
