import { FLWDirectChargeDataTypes } from "@omenai/shared-types";
import { ICity, IState } from "country-state-city";
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
  selectedCountry: { country: string; code: string };
  setSelectedCountry: (country: string, code: string) => void;
  selectedCityList: ICity[];
  setSelectedCityList: (value: ICity[]) => void;
  selectedStateList: IState[];
  setSelectedStateList: (value: IState[]) => void;
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
  selectedCountry: { country: "", code: "" },
  setSelectedCountry: (country: string, code: string) => {
    set({ selectedCountry: { country, code } });
  },

  selectedCityList: [],
  setSelectedCityList: (value: ICity[]) => {
    set({ selectedCityList: value });
  },
  selectedStateList: [],
  setSelectedStateList: (value: IState[]) => {
    set({ selectedStateList: value });
  },
}));
