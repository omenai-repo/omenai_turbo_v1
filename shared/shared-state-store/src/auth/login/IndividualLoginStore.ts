import { create } from "zustand";

type IndividualLoginStoreTypes = {
  isLoading: boolean;
  setIsLoading: () => void;
};

export const individualLoginStore = create<IndividualLoginStoreTypes>(
  (set, get) => ({
    isLoading: false,
    setIsLoading: () => {
      const loadingState = get().isLoading;

      set({ isLoading: !loadingState });
    },
  })
);
