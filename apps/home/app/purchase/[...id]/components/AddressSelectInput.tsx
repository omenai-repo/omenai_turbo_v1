"use client";
import { actionStore } from "@omenai/shared-state-store/src/actions/ActionStore";
import { orderStore } from "@omenai/shared-state-store/src/orders/ordersStore";
import { ChangeEvent } from "react";

type AddressSelectInputProps = {
  label: string;
  items?: string[];
  onChange?: (e: ChangeEvent<HTMLSelectElement>) => void;
  name: string;
  required: boolean;
  defaultValue?: string | undefined;
};
export default function AddressSelectInput({
  label,
  items,
  onChange,
  name,
  required,
  defaultValue,
}: AddressSelectInputProps) {
  const { setSelectedCountry, countryStates, setCountryStates } = actionStore();

  const { setAddress } = orderStore();

  function handleCountrySelectChange(e: ChangeEvent<HTMLSelectElement>) {
    if (e.target.value !== "") {
      setSelectedCountry(e.target.value);
      setCountryStates();
      setAddress(name, e.target.value);
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="text-dark/80 font-normal text-xs">
        {label}
      </label>
      {name !== "state" ? (
        <select
          onChange={handleCountrySelectChange}
          required={required}
          defaultValue={defaultValue !== undefined ? defaultValue : ""}
          className="border-0 border-b bg-transparent text-xs ring-0 disabled:cursor-not-allowed border-b-dark/20 w-full p-2 focus:border-b-dark focus:ring-0 placeholder:font-light placeholder:text-dark text-dark"
        >
          <option value="">Select</option>
          {items &&
            items.map((item, index) => {
              return (
                <option
                  key={item}
                  value={item}
                  className="p-3 font-light text-dark text-xs"
                >
                  {item}
                </option>
              );
            })}
        </select>
      ) : (
        <select
          disabled={countryStates.length === 0}
          required={required}
          defaultValue={defaultValue !== undefined ? defaultValue : ""}
          onChange={(e: ChangeEvent<HTMLSelectElement>) =>
            setAddress(name, e.target.value)
          }
          className="border-0 border-b bg-transparent text-xs ring-0 disabled:cursor-not-allowed border-b-dark/20 w-full p-2 focus:border-b-dark focus:ring-0 placeholder:font-light placeholder:text-dark text-dark"
        >
          <option value="">Select</option>
          {countryStates.length > 0 &&
            countryStates.map((state, index) => {
              return (
                <option
                  key={state}
                  value={state}
                  className="p-3 font-light text-dark text-xs"
                >
                  {state}
                </option>
              );
            })}
        </select>
      )}
    </div>
  );
}
