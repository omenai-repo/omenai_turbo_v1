"use client";
import { actionStore } from "@omenai/shared-state-store/src/actions/ActionStore";
import { orderStore } from "@omenai/shared-state-store/src/orders/ordersStore";
import { IState, ICity, ICountry, State, City } from "country-state-city";
import { ChangeEvent } from "react";
import { MdError } from "react-icons/md";

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

  const { setAddress } = orderStore();

  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const selectedCode =
      e.target.options[e.target.selectedIndex].getAttribute("data-code");

    if (labelText === "country") {
      setSelectedCityList([]);
      setSelectedCountry(value, selectedCode as string);
      const stateList = State.getStatesOfCountry(selectedCode as string);
      setSelectedStateList(stateList);
    }
    if (labelText === "state") {
      const cities = City.getCitiesOfState(
        selectedCountry.code,
        selectedCode as string
      );
      setSelectedCityList(cities);
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      <label htmlFor={name} className="text-gray-700/80 font-normal text-xs">
        {label}
      </label>
      <select
        required={true}
        onChange={handleChange}
        className="border-0 ring-1 ring-dark/20 focus:ring text-xs font-medium disabled:cursor-not-allowed disabled:bg-dark/10 focus:ring-dark px-6 py-2 sm:py-3 rounded-full placeholder:text-xs placeholder:text-gray-700/40"
      >
        <option
          value=""
          selected={defaultValue === ""}
          className="text-gray-700/40"
        >
          Select {labelText}
        </option>
        <>
          {labelText === "country" &&
            items.map((item: ICountry) => {
              return (
                <option
                  key={item.isoCode}
                  value={item.name}
                  data-code={item.isoCode}
                  selected={
                    defaultValue?.toLowerCase() === item.name.toLowerCase()
                  }
                  className="px-3 py-5 my-5 text-xs font-medium text-gray-700/40"
                >
                  {item.name}
                </option>
              );
            })}
          {labelText === "state" &&
            selectedStateList.map((state: IState) => {
              return (
                <option
                  key={state.isoCode}
                  value={state.name}
                  data-code={state.isoCode}
                  selected={
                    defaultValue?.toLowerCase() === state.name.toLowerCase()
                  }
                  className="px-3 py-5 my-5 text-xs font-medium text-gray-700/40"
                >
                  {state.name}
                </option>
              );
            })}

          {labelText === "city" &&
            selectedCityList.map((city: ICity) => {
              return (
                <option
                  key={city.name}
                  value={city.name}
                  data-code={city.name}
                  selected={
                    defaultValue?.toLowerCase() === city.name.toLowerCase()
                  }
                  className="px-3 py-5 my-5 text-xs font-medium text-gray-700/40"
                >
                  {city.name}
                </option>
              );
            })}
        </>
      </select>
    </div>
  );
}
