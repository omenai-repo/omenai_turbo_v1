import { create } from "zustand";

type GalleryLoginStoreTypes = {
  isLoading: boolean;
  setIsLoading: () => void;
};

export const galleryLoginStore = create<GalleryLoginStoreTypes>((set, get) => ({
  isLoading: false,
  setIsLoading: () => {
    const loadingState = get().isLoading;

    set({ isLoading: !loadingState });
  },
}));
