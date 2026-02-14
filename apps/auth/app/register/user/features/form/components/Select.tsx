"use client";

import { useIndividualAuthStore } from "@omenai/shared-state-store/src/auth/register/IndividualAuthStore";
import {
  GallerySignupData,
  AddressTypes,
  IndividualSignupData,
} from "@omenai/shared-types";
import { AnimatePresence, motion } from "framer-motion";
import { ChangeEvent, useState } from "react";
import { MdError } from "react-icons/md";
import {
  Country,
  State,
  IState,
  City,
  ICity,
  ICountry,
} from "country-state-city";
import { SELECT_CLASS } from "@omenai/shared-ui-components/components/styles/inputClasses";

type SelectInputProps = {
  label: string;
  labelText: string;
  items: ICountry[] | IState[] | ICity[];
  onChange?: (e: ChangeEvent<HTMLSelectElement>) => void;
  name: string;
  required: boolean;
};

export default function SelectInput({
  label,
  labelText,
  items,
  name,
  required,
}: SelectInputProps) {
  const {
    individualSignupData,
    currentSignupFormIndex,
    updateSignUpData,
    setIsFieldDirty,
    isFieldDirty,
    selectedCityList,
    setSelectedCityList,
  } = useIndividualAuthStore();

  const countryList: ICountry[] = Country.getAllCountries();
  const stateList: IState[] = State.getStatesOfCountry(
    individualSignupData.countryCode,
  );
  const [errorList, setErrorList] = useState<string[]>([]);

  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const selectedOption = e.target.options[e.target.selectedIndex];
    const selectedCode = selectedOption.dataset.code || "";

    updateSignUpData(labelText, value);

    if (labelText === "country") {
      updateSignUpData("state", "");
      updateSignUpData("city", "");
      setSelectedCityList([]);
      updateSignUpData("countryCode", selectedCode as string);
    }
    if (labelText === "state") {
      updateSignUpData("city", "");
      const cities = City.getCitiesOfState(
        individualSignupData.countryCode,
        selectedCode as string,
      );
      updateSignUpData("stateCode", selectedCode as string);
      setSelectedCityList(cities);
    }
    setIsFieldDirty(
      labelText as keyof IndividualSignupData & AddressTypes,
      false,
    );
  };

  return (
    <AnimatePresence key={`${currentSignupFormIndex}-gallery`}>
      <motion.div
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ y: -100 }}
        transition={{ duration: 0.33 }}
        className="flex flex-col gap-y-1"
      >
        <div className="flex flex-col gap-1">
          <label htmlFor={name} className="text-dark font-light text-fluid-xxs">
            {label}
          </label>
          <select
            value={(individualSignupData as Record<string, any>)[labelText]}
            onChange={handleChange}
            required={required}
            disabled={
              (labelText === "state" && individualSignupData.country === "") ||
              (labelText === "city" &&
                (individualSignupData.state === "" ||
                  individualSignupData.country === ""))
            }
            className={SELECT_CLASS}
          >
            <option value="" className="text-dark">
              Select {labelText}
            </option>
            <>
              {labelText === "country" &&
                (items as ICountry[]).map((country: ICountry) => {
                  return (
                    <option
                      key={country.isoCode}
                      value={country.name}
                      data-code={country.isoCode}
                      className="px-3 py-5 my-5 text-fluid-xxs font-light text-dark"
                    >
                      {country.name}
                    </option>
                  );
                })}
              {labelText === "state" &&
                stateList.map((state: IState) => {
                  return (
                    <option
                      key={state.isoCode}
                      value={state.name}
                      data-code={state.isoCode}
                      className="px-3 py-5 my-5 text-fluid-xxs font-light text-dark"
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
                      className="px-3 py-5 my-5 text-fluid-xxs font-light text-dark"
                    >
                      {city.name}
                    </option>
                  );
                })}
            </>
          </select>

          {errorList.length > 0 &&
            errorList.map((error, index) => {
              return (
                <div
                  key={`${index}-error_list`}
                  className="flex items-center gap-x-2"
                >
                  <MdError className="text-red-600" />
                  <p className="text-red-600 text-fluid-xxs">{error}</p>
                </div>
              );
            })}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
