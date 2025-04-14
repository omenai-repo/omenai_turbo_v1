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
    const selectedCode =
      e.target.options[e.target.selectedIndex].getAttribute("data-code");

    updateArtistSignupData(labelText, value);
    if (labelText === "country") {
      updateArtistSignupData("state", "");
      updateArtistSignupData("city", "");
      setSelectedCityList([]);
      updateArtistSignupData("countryCode", selectedCode as string);
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
        className="flex flex-col gap-y-1 xl:container"
      >
        <div className="flex flex-col gap-1">
          <label
            htmlFor={name}
            className="text-gray-700/80 font-normal text-xs"
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
            className="border-0 ring-1 ring-dark/20 focus:ring text-xs font-medium disabled:cursor-not-allowed disabled:bg-dark/10 focus:ring-dark px-6 py-2 sm:py-3 rounded-full placeholder:text-xs placeholder:text-gray-700/40"
          >
            <option value="" className="text-gray-700/40">
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
                        className="px-3 py-5 my-5 text-xs font-medium text-gray-700/40"
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
                      className="px-3 py-5 my-5 text-xs font-medium text-gray-700/40"
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
                  <p className="text-red-600 text-[14px]">{error}</p>
                </div>
              );
            })}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
