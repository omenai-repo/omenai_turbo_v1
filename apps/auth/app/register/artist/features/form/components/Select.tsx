"use client";
import { useArtistAuthStore } from "@omenai/shared-state-store/src/auth/register/ArtistAuthStore";
import { AddressTypes, ArtistSignupData } from "@omenai/shared-types";
import { City, ICity, IState, State } from "country-state-city";
import { AnimatePresence, motion } from "framer-motion";
import { ChangeEvent, useState } from "react";
import { MdError } from "react-icons/md";

type SelectInputProps = {
  label: string;
  labelText: string;
  items: { name: string; alpha2: string; alpha3: string; currency: string }[];
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
    artistSignupData,
    currentArtistSignupFormIndex,
    updateArtistSignupData,
    setIsFieldDirty,
    isFieldDirty,
    selectedCityList,
    selectedStateList,
    setSelectedCityList,
    setSelectedStateList,
  } = useArtistAuthStore();

  const [errorList, setErrorList] = useState<string[]>([]);

  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const selectedOption = e.target.options[e.target.selectedIndex];
    const selectedCode = selectedOption.dataset.code || "";
    const selectedCurrency = selectedOption.dataset.currency || "";

    updateArtistSignupData(labelText, value);
    if (labelText === "country") {
      updateArtistSignupData("state", "");
      updateArtistSignupData("city", "");
      setSelectedCityList([]);
      updateArtistSignupData("countryCode", selectedCode as string);
      updateArtistSignupData("base_currency", selectedCurrency as string);
      const stateList = State.getStatesOfCountry(selectedCode as string);
      setSelectedStateList(stateList);
    }
    if (labelText === "state") {
      updateArtistSignupData("city", "");
      const cities = City.getCitiesOfState(
        artistSignupData.countryCode,
        selectedCode as string
      );
      updateArtistSignupData("stateCode", selectedCode as string);
      setSelectedCityList(cities);
    }

    setIsFieldDirty(labelText as keyof ArtistSignupData & AddressTypes, false);
  };

  return (
    <AnimatePresence key={`${currentArtistSignupFormIndex}-gallery`}>
      <motion.div
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ y: -100 }}
        transition={{ duration: 0.33 }}
        className="flex flex-col gap-y-1"
      >
        <div className="flex flex-col gap-1">
          <label
            htmlFor={name}
            className="text-dark font-normal text-fluid-xxs"
          >
            {label}
          </label>
          <select
            value={(artistSignupData as Record<string, any>)[labelText]}
            onChange={handleChange}
            required={true}
            disabled={
              (labelText === "state" && artistSignupData.country === "") ||
              (labelText === "city" &&
                (artistSignupData.state === "" ||
                  artistSignupData.country === ""))
            }
            className="border-0 ring-1 ring-dark/20 focus:ring text-fluid-xxs font-normal disabled:cursor-not-allowed disabled:bg-dark/10 focus:ring-dark px-6 py-2 sm:py-3 rounded placeholder:text-fluid-xxs placeholder:text-dark"
          >
            <option value="" className="text-dark">
              Select {labelText}
            </option>
            <>
              {labelText === "country" &&
                items.map(
                  (item: {
                    name: string;
                    alpha2: string;
                    alpha3: string;
                    currency: string;
                  }) => {
                    return (
                      <option
                        key={item.alpha2}
                        value={item.name}
                        data-code={item.alpha2}
                        data-currency={item.currency}
                        className="px-3 py-5 my-5 text-fluid-xxs font-normal text-dark"
                      >
                        {item.name}
                      </option>
                    );
                  }
                )}
              {labelText === "state" &&
                selectedStateList.map((state: IState) => {
                  return (
                    <option
                      key={state.isoCode}
                      value={state.name}
                      data-code={state.isoCode}
                      className="px-3 py-5 my-5 text-fluid-xxs font-normal text-dark"
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
                      className="px-3 py-5 my-5 text-fluid-xxs font-normal text-dark"
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
