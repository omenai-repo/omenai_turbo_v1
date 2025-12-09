import { IndividualProfileUpdateData } from "@omenai/shared-types";
import { create } from "zustand";

type IndividualProfileUdateStoreTypes = {
  updateData: IndividualProfileUpdateData;
  setProfileUpdateData: (label: string, value: string) => void;
  clearData: () => void;
  setInitialPreferencesData: (label: string, value: string[]) => void;
};

export const individualProfileUdateStore =
  create<IndividualProfileUdateStoreTypes>((set, get) => ({
    updateData: { name: "", preferences: [] },
    setInitialPreferencesData: (label, value) => {
      const update = get().updateData;
      const new_update = { ...update, [label]: value };
      set({ updateData: new_update as IndividualProfileUpdateData });
    },

    setProfileUpdateData: (label, value) => {
      const update = get().updateData;

      if (label === "preferences") {
        const pref = new Set(update.preferences);
        pref.has(value) ? pref.delete(value) : pref.size < 5 && pref.add(value);
        const new_update: IndividualProfileUpdateData = {
          ...update,
          preferences: Array.from(pref),
        };

        set({ updateData: new_update as IndividualProfileUpdateData });
      } else {
        const updatedData = { ...update, [label]: value };

        set({ updateData: updatedData as IndividualProfileUpdateData });
      }
    },

    clearData: () => {
      set({ updateData: { name: "", preferences: [] } });
    },
  }));
