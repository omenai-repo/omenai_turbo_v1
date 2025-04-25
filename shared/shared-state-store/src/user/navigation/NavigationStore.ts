import { create } from "zustand";

type UserDashboardNavigationStoreTypes = {
  selected: string;
  setSelected: (label: string) => void;
  artist_selected: string;
  artist_setSelected: (label: string) => void;
};

export const UserDashboardNavigationStore =
  create<UserDashboardNavigationStoreTypes>((set, get) => ({
    selected: "",
    setSelected: (label: string) => {
      set({ selected: label });
    },
    artist_selected: "",
    artist_setSelected: (label: string) => {
      set({ selected: label });
    },
  }));
