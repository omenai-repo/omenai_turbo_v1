"use client";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { actionStore } from "@omenai/shared-state-store/src/actions/ActionStore";
import { orderStore } from "@omenai/shared-state-store/src/orders/ordersStore";
import { IndividualSchemaTypes } from "@omenai/shared-types";
import { IState, ICity, ICountry, State, City } from "country-state-city";
import { ChangeEvent } from "react";

type AddressSelectInputProps = {
  label: string;
  labelText: string;
  items: ICountry[];
  onChange?: (e: ChangeEvent<HTMLSelectElement>) => void;
  name: string;
  defaultValue?: string | undefined;
};
export default function AddressSelectInput({
  label,
  items,
  onChange,
  name,
  defaultValue,
  labelText,
}: AddressSelectInputProps) {
  const {
    selectedCityList,
    setSelectedStateList,
    selectedStateList,
    setSelectedCityList,
    setSelectedCountry,
    selectedCountry,
  } = actionStore();

  const { address, setAddress } = orderStore();
  const { user } = useAuth({ requiredRole: "user" });

  const selectValue = () => {
    if (labelText === "country") return address.country;
    if (labelText === "city") return address.city;
    if (labelText === "state") return address.state;
  };

  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const selectedCode = e.target.options[e.target.selectedIndex].getAttribute(
      "data-code"
    ) as string;

    if (labelText === "country") {
      setSelectedCityList([]);
      setSelectedCountry(value, selectedCode as string);
      const stateList = State.getStatesOfCountry(selectedCode as string);
      setSelectedStateList(stateList);
      setAddress(labelText, value);
      setAddress("countryCode", selectedCode);
    }
    if (labelText === "state") {
      const cities = City.getCitiesOfState(
        selectedCountry.code,
        selectedCode as string
      );
      setSelectedCityList(cities);
      setAddress(labelText, value);
      setAddress("stateCode", selectedCode);
    }
    if (labelText === "city") {
      setAddress(labelText, value);
    }
  };

  return (
    // Beautiful Select Component
    <div className="w-full space-y-2">
      <label
        htmlFor={name}
        className="block text-sm font-medium text-slate-700"
      >
        {label}
      </label>

      <div className="relative">
        <select
          id={name}
          name={name}
          required={true}
          onChange={handleChange}
          value={selectValue()}
          className="
        appearance-none
        w-full
        px-4
        py-3
        pr-10
        bg-white
        border
        border-slate-300
        rounded
        text-slate-900
        text-sm
        font-normal
        transition-all
        duration-200
        focus:border-slate-900
        focus:ring-2
        focus:ring-slate-900
        focus:ring-offset-0
        focus:outline-none
        disabled:bg-slate-50
        disabled:text-slate-500
        disabled:cursor-not-allowed
        cursor-pointer
      "
        >
          <option value="" className="text-slate-400">
            Select {labelText}
          </option>

          {labelText === "country" &&
            items.map((item: ICountry) => (
              <option
                key={item.isoCode}
                value={item.name}
                data-code={item.isoCode}
                className="text-slate-900 py-2"
              >
                {item.name}
              </option>
            ))}

          {labelText === "state" &&
            selectedStateList.map((state: IState) => (
              <option
                key={state.isoCode}
                value={state.name}
                data-code={state.isoCode}
                className="text-slate-900 py-2"
              >
                {state.name}
              </option>
            ))}

          {labelText === "city" &&
            selectedCityList.map((city: ICity) => (
              <option
                key={city.name}
                value={city.name}
                data-code={city.name}
                className="text-slate-900 py-2"
              >
                {city.name}
              </option>
            ))}
        </select>
      </div>
    </div>
  );
}
