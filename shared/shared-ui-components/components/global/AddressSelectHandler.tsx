"use client";
import { AddressTypes } from "@omenai/shared-types";
import { SELECT_CLASS } from "../styles/inputClasses";
import { City, ICity, ICountry, IState, State } from "country-state-city";
import { ChangeEvent, useEffect, useState } from "react";
import { MdError } from "react-icons/md";

type CountryItem = {
  name: string;
  isoCode?: string;
  alpha2?: string;
  alpha3?: string;
  code?: string;
  currency?: string;
};

type SelectInputProps = {
  label: string;
  labelText: string;
  items: CountryItem[];
  onChange: React.Dispatch<React.SetStateAction<AddressTypes>>;
  name: string;
  required: boolean;
  address: AddressTypes;
  updateCurrency?: React.Dispatch<React.SetStateAction<string>>;
};

export default function SelectInput({
  label,
  labelText,
  items,
  name,
  onChange,
  address,
  updateCurrency,
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
    const selectedOption = e.target.options[e.target.selectedIndex];
    const selectedCode = selectedOption.dataset.code || "";
    const selectedCurrency = selectedOption.dataset.currency || "";

    if (labelText === "country") {
      onChange((prev) => ({
        ...prev,
        country: value,
        countryCode: selectedCode || "",
        state: "",
        stateCode: "",
        city: "",
      }));

      // Only update currency if updateCurrency function is provided
      if (updateCurrency && selectedCurrency) {
        updateCurrency(selectedCurrency);
      }
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
          className={SELECT_CLASS}
        >
          <option value="" className="text-dark">
            Select {labelText}
          </option>

          {labelText === "country" &&
            items.map((item) => {
              const itemCode = item.alpha2 || item.code || item.isoCode;
              return (
                <option
                  key={itemCode}
                  value={item.name}
                  data-code={itemCode}
                  data-currency={item.currency}
                  className="px-3 py-5 my-5 text-fluid-xxs font-normal text-dark"
                >
                  {item.name}
                </option>
              );
            })}

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
