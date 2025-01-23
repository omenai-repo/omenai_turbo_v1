import { IndividualAddressTypes } from "@omenai/shared-types";
import { create } from "zustand";

type OrderStoreTypes = {
  address: IndividualAddressTypes;
  setAddress: (label: string, value: string) => void;
  set_address_on_order: (address: IndividualAddressTypes) => void;
};
export const orderStore = create<OrderStoreTypes>((set, get) => ({
  address: {
    address_line: "",
    city: "",
    country: "",
    state: "",
    zip: "",
  },
  setAddress: (label: string, value: string) => {
    const data: Record<string, any> = get().address;

    if (label in data) {
      const updatedData = { ...data, [label]: value };

      set({
        address: updatedData as IndividualAddressTypes,
      });
    }
  },
  set_address_on_order: (address: IndividualAddressTypes) => {
    set({ address });
  },
}));
