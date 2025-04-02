import { ArtistOnboardingData, Socials } from "@omenai/shared-types";
import { create } from "zustand";

type ArtistOnboardingStoreTypes = {
  onboardingData: ArtistOnboardingData;
  updateOnboardingData: (
    label: keyof ArtistOnboardingData,
    value: any,
    social_key?: keyof Socials
  ) => void;
  field_completion_state: Record<keyof ArtistOnboardingData, boolean>;
  update_field_completion_state: (
    label: keyof ArtistOnboardingData,
    value: boolean
  ) => void;
};
export const artistOnboardingStore = create<ArtistOnboardingStoreTypes>(
  (set, get) => ({
    onboardingData: {
      bio: "",
      cv: null,
      graduate: "",
      mfa: "",
      biennale: "",
      museum_collection: "",
      art_fair: "",
      museum_exhibition: "",
      solo: "",
      group: "",
      socials: { instagram: "", twitter: "", linkedin: "" },
    },
    updateOnboardingData: (
      label: keyof ArtistOnboardingData,
      value: any,
      social_key?: keyof Socials
    ) => {
      const data = get().onboardingData;

      if (!(label in data)) return;

      if (label === "socials") {
        if (!social_key || !(social_key in data.socials)) return;
        const updatedSocials = { ...data.socials, [social_key]: value };
        set({ onboardingData: { ...data, socials: updatedSocials } });
        return;
      }

      if (data[label] === value) return;
      set({ onboardingData: { ...data, [label]: value } });
    },
    field_completion_state: {
      bio: false,
      cv: false,
      graduate: false,
      mfa: false,
      biennale: false,
      museum_collection: false,
      art_fair: false,
      museum_exhibition: false,
      solo: false,
      group: false,
      socials: false,
    },
    update_field_completion_state: (
      label: keyof ArtistOnboardingData,
      value: boolean
    ) => {
      set((state: any) => ({
        field_completion_state: {
          ...state.field_completion_state,
          [label]: value,
        },
      }));
    },
  })
);
