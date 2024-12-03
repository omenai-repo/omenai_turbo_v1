import { FLWDirectChargeDataTypes } from "@omenai/shared-types";
import { create } from "zustand";

type StepperStoreTypes = {
  avs_input_fields: string[];
  updateAvsFields: (fields: string[]) => void;
  flw_charge_payload: FLWDirectChargeDataTypes & { name: string };
  update_flw_charge_payload_data: (
    data: FLWDirectChargeDataTypes & { name: string }
  ) => void;
  flw_ref: string;
  set_flw_ref: (ref: string) => void;
};

export const stepperStore = create<StepperStoreTypes>((set, get) => ({
  avs_input_fields: [],
  updateAvsFields: (fields: string[]) => {
    set({ avs_input_fields: fields });
  },
  // authorization: {} as AuthorizationData,
  // updateAuthorizationData: (data: AuthorizationData) => {
  //   set({ authorization: data });
  // },
  flw_charge_payload: {} as FLWDirectChargeDataTypes & { name: string },
  update_flw_charge_payload_data: (
    data: FLWDirectChargeDataTypes & { name: string }
  ) => {
    set({ flw_charge_payload: data });
  },
  flw_ref: "",
  set_flw_ref: (ref: string) => {
    set({ flw_ref: ref });
  },
}));
