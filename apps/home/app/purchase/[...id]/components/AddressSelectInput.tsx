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
    <div className="flex flex-col gap-x-4 gap-y-2 w-full">
      <label htmlFor={name} className="text-dark font-normal text-fluid-xs">
        {label}
      </label>
      <select
        required={true}
        onChange={handleChange}
        value={selectValue()}
        className="border-0 ring-1 ring-dark/20 focus:ring text-fluid-xs font-normal disabled:cursor-not-allowed disabled:bg-dark/10 focus:ring-dark px-6 py-2 sm:py-3 rounded-full placeholder:text-fluid-xxs placeholder:text-dark/40"
      >
        <option value="" className="text-dark/40">
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
                  className="px-3 py-5 my-5 text-fluid-xs font-normal text-dark/40"
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
                  className="px-3 py-5 my-5 text-fluid-xxs font-normal text-dark/40"
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
                  defaultValue={city.name}
                  data-code={city.name}
                  className="px-3 py-5 my-5 text-fluid-xxs font-normal text-dark/40"
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
