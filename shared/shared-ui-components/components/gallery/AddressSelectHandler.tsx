"use client";
import { AddressTypes } from "@omenai/shared-types";
import { City, ICity, IState, State } from "country-state-city";
import { AnimatePresence, motion } from "framer-motion";
import { ChangeEvent, useEffect, useState } from "react";
import { MdError } from "react-icons/md";

type SelectInputProps = {
  label: string;
  labelText: string;
  items: { name: string; code: string }[];
  onChange: React.Dispatch<React.SetStateAction<AddressTypes>>;
  name: string;
  required: boolean;
  address: AddressTypes;
};

export default function SelectInput({
  label,
  labelText,
  items,
  name,
  onChange,
  address,
}: SelectInputProps) {
  const [errorList, setErrorList] = useState<string[]>([]);
  const [stateList, setStateList] = useState<IState[]>([]);
  const [cityList, setCityList] = useState<ICity[]>([]);

  // 🔹 Auto-update states when country changes
  useEffect(() => {
    if (address.countryCode) {
      const states = State.getStatesOfCountry(address.countryCode);
      setStateList(states);
      setCityList([]); // reset cities when country changes
    } else {
      setStateList([]);
      setCityList([]);
    }
  }, [address.countryCode]);

  // 🔹 Auto-update cities when state changes
  useEffect(() => {
    if (address.countryCode && address.stateCode) {
      const cities = City.getCitiesOfState(
        address.countryCode,
        address.stateCode
      );
      setCityList(cities);
    } else {
      setCityList([]);
    }
  }, [address.countryCode, address.stateCode]);

  // 🔹 Handle selection changes
  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const selectedCode =
      e.target.options[e.target.selectedIndex].getAttribute("data-code");

    if (labelText === "country") {
      onChange((prev) => ({
        ...prev,
        country: value,
        countryCode: selectedCode || "",
        state: "",
        stateCode: "",
        city: "",
      }));
    }

    if (labelText === "state") {
      onChange((prev) => ({
        ...prev,
        state: value,
        stateCode: selectedCode || "",
        city: "",
      }));
    }

    if (labelText === "city") {
      onChange((prev) => ({
        ...prev,
        city: value,
      }));
    }
  };

  return (
    <div className="flex flex-col gap-y-1">
      <div className="flex flex-col gap-1">
        <label htmlFor={name} className="text-dark font-normal text-fluid-xxs">
          {label}
        </label>

        <select
          id={name}
          value={(address as Record<string, any>)[labelText] || ""}
          onChange={handleChange}
          required={true}
          disabled={
            (labelText === "state" && !address.country) ||
            (labelText === "city" && (!address.state || !address.country))
          }
          className="border-0 ring-1 ring-dark/20 focus:ring text-fluid-xxs font-normal disabled:cursor-not-allowed disabled:bg-dark/10 focus:ring-dark px-6 py-2 sm:py-3 rounded placeholder:text-fluid-xxs placeholder:text-dark"
        >
          <option value="" className="text-dark">
            Select {labelText}
          </option>

          {labelText === "country" &&
            items.map((item) => (
              <option
                key={item.code}
                value={item.name}
                data-code={item.code}
                className="px-3 py-5 my-5 text-fluid-xxs font-normal text-dark"
              >
                {item.name}
              </option>
            ))}

          {labelText === "state" &&
            stateList.map((state) => (
              <option
                key={state.isoCode}
                value={state.name}
                data-code={state.isoCode}
                className="px-3 py-5 my-5 text-fluid-xxs font-normal text-dark"
              >
                {state.name}
              </option>
            ))}

          {labelText === "city" &&
            cityList.map((city) => (
              <option
                key={city.name}
                value={city.name}
                data-code={city.name}
                className="px-3 py-5 my-5 text-fluid-xxs font-normal text-dark"
              >
                {city.name}
              </option>
            ))}
        </select>

        {errorList.length > 0 &&
          errorList.map((error, index) => (
            <div
              key={`${index}-error_list`}
              className="flex items-center gap-x-2"
            >
              <MdError className="text-red-600" />
              <p className="text-red-600 text-fluid-xxs">{error}</p>
            </div>
          ))}
      </div>
    </div>
  );
}
