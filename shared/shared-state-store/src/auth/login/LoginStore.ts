import { create } from "zustand";

type loginStoreTypes = {
  current: number;
  updateCurrent: (e: number) => void;
};

export const useLoginStore = create<loginStoreTypes>(
  (set, get) => ({
    current: 0,
    updateCurrent: (e) => {
      set({ current: e });
    },
  })
);
