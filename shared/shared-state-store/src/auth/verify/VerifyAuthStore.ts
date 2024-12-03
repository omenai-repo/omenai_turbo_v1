import { create } from "zustand";

type VerifyStoreTypes = {
  isLoading: boolean;
  setIsLoading: () => void;
};
export const verifyAuthStore = create<VerifyStoreTypes>((set, get) => ({
  isLoading: false,
  setIsLoading: () => {
    const loadingState = get().isLoading;

    set({ isLoading: !loadingState });
  },
}));
