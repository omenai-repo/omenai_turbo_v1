import { create } from "zustand";

type AdminNavigationStore = {
  open: boolean;
  setOpen: (val?: boolean) => void;
  openMobileNav: boolean;
  setOpenMobileNav: () => void;
};

export const adminNavigationActions = create<AdminNavigationStore>(
  (set, get) => ({
    open: false,
    setOpen: (val?: boolean) => {
      const openState = get().open;
      if (val && typeof val === "boolean") {
        set({ open: val });
      } else {
        set({ open: !openState });
      }
    },
    openMobileNav: false,
    setOpenMobileNav: () => {
      const openState = get().openMobileNav;

      set({ openMobileNav: !openState });
    },
  })
);
