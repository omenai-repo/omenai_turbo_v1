"use client";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { actionStore } from "@omenai/shared-state-store/src/actions/ActionStore";
import { orderStore } from "@omenai/shared-state-store/src/orders/ordersStore";
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
  name,
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

  const selectValue = () => {
    if (labelText === "country") return address.country;
    if (labelText === "city") return address.city;
    if (labelText === "state") return address.state;
  };

  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const selectedOption = e.target.options[e.target.selectedIndex];
    const selectedCode = selectedOption.dataset.code || "";

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
        selectedCode as string,
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
    <div className="w-full space-y-2">
      <label
        htmlFor={name}
        className="block font-mono text-[10px] uppercase tracking-widest text-neutral-500"
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
          className={`
            w-full bg-white px-4 py-3
            font-sans text-sm text-dark
            border border-neutral-300 
            rounded-none
            focus:border-dark focus:ring-0 focus:outline-none
            appearance-none
            transition-colors duration-200
          `}
        >
          <option value="" className="text-neutral-400">
            Select {labelText}
          </option>

          {labelText === "country" &&
            items.map((item: ICountry) => (
              <option
                key={item.isoCode}
                value={item.name}
                data-code={item.isoCode}
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
              >
                {state.name}
              </option>
            ))}

          {labelText === "city" &&
            selectedCityList.map((city: ICity) => (
              <option key={city.name} value={city.name} data-code={city.name}>
                {city.name}
              </option>
            ))}
        </select>
      </div>
    </div>
  );
}
