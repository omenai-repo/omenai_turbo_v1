import { PromotionalDataUpdateTypes } from "@omenai/shared-types";
import { ObjectId } from "mongoose";
import { create } from "zustand";

type PromotionalStoreTypes = {
  openModal: boolean;
  setOpenModal: (val: boolean) => void;
  data: (PromotionalDataUpdateTypes & { id: ObjectId }) | null;
  setData: (
    data: (PromotionalDataUpdateTypes & { id: ObjectId }) | null
  ) => void;
};
export const promotionalStore = create<PromotionalStoreTypes>((set, get) => ({
  openModal: false,
  setOpenModal: (val: boolean) => {
    set({ openModal: val });
  },
  data: null,
  setData: (data: (PromotionalDataUpdateTypes & { id: ObjectId }) | null) => {
    set({ data });
  },
}));
