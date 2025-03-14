import { AddressTypes } from "@omenai/shared-types";

export const indexAddress = (label: string, address: AddressTypes) => {
  if (label in address) {
    return address[label as keyof AddressTypes];
  }
};
