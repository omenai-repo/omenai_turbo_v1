import { AddressTypes } from "@omenai/shared-types";
import { create } from "zustand";

type OrderStoreTypes = {
  address: AddressTypes;
  setAddress: (label: string, value: string) => void;
  set_address_on_order: (address: AddressTypes) => void;
};
export const orderStore = create<OrderStoreTypes>((set, get) => ({
  address: {
    address_line: "",
    city: "",
    country: "",
    state: "",
    zip: "",
    countryCode: "",
    stateCode: "",
  },
  setAddress: (label: string, value: string) => {
    const data: Record<string, any> = get().address;

    if (label in data) {
      const updatedData = { ...data, [label]: value };

      set({
        address: updatedData as AddressTypes,
      });
    }
  },
  set_address_on_order: (address: AddressTypes) => {
    set({ address });
  },
}));
