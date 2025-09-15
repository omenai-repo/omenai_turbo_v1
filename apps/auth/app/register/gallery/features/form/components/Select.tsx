"use client";
import { useGalleryAuthStore } from "@omenai/shared-state-store/src/auth/register/GalleryAuthStore";
import { GallerySignupData, AddressTypes } from "@omenai/shared-types";
import { City, ICity, IState, State } from "country-state-city";
import { AnimatePresence, motion } from "framer-motion";
import { ChangeEvent, useState } from "react";
import { MdError, MdOutlineArrowForward } from "react-icons/md";

type SelectInputProps = {
  label: string;
  labelText: string;
  items: { code: string; name: string }[];
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
    gallerySignupData,
    currentGallerySignupFormIndex,
    updateGallerySignupData,
    setIsFieldDirty,
    isFieldDirty,
    selectedCityList,
    selectedStateList,
    setSelectedCityList,
    setSelectedStateList,
  } = useGalleryAuthStore();

  const [errorList, setErrorList] = useState<string[]>([]);

  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const selectedCode =
      e.target.options[e.target.selectedIndex].getAttribute("data-code");

    updateGallerySignupData(labelText, value);
    if (labelText === "country") {
      updateGallerySignupData("state", "");
      updateGallerySignupData("city", "");
      setSelectedCityList([]);
      updateGallerySignupData("countryCode", selectedCode as string);
      const stateList = State.getStatesOfCountry(selectedCode as string);
      setSelectedStateList(stateList);
    }
    if (labelText === "state") {
      updateGallerySignupData("city", "");
      const cities = City.getCitiesOfState(
        gallerySignupData.countryCode,
        selectedCode as string
      );
      updateGallerySignupData("stateCode", selectedCode as string);
      setSelectedCityList(cities);
    }

    setIsFieldDirty(labelText as keyof GallerySignupData & AddressTypes, false);
  };

  return (
    <AnimatePresence key={`${currentGallerySignupFormIndex}-gallery`}>
      <motion.div
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ y: -100 }}
        transition={{ duration: 0.33 }}
        className="flex flex-col gap-y-1"
      >
        <div className="flex flex-col gap-1">
          <label htmlFor={name} className="text-dark font-normal text-fluid-xs">
            {label}
          </label>
          <select
            value={(gallerySignupData as Record<string, any>)[labelText]}
            onChange={handleChange}
            required={true}
            disabled={
              (labelText === "state" && gallerySignupData.country === "") ||
              (labelText === "city" &&
                (gallerySignupData.state === "" ||
                  gallerySignupData.country === ""))
            }
            className="border-0 ring-1 ring-dark/20 focus:ring text-fluid-xs font-medium disabled:cursor-not-allowed disabled:bg-dark/10 focus:ring-dark px-6 py-2 sm:py-3 rounded placeholder:text-fluid-xs placeholder:text-dark/40"
          >
            <option value="" className="text-dark/40">
              Select {labelText}
            </option>
            <>
              {labelText === "country" &&
                items.map((item: { code: string; name: string }) => {
                  return (
                    <option
                      key={item.code}
                      value={item.name}
                      data-code={item.code}
                      className="px-3 py-5 my-5 text-fluid-xs font-medium text-dark/40"
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
                      className="px-3 py-5 my-5 text-fluid-xs font-medium text-dark/40"
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
                      className="px-3 py-5 my-5 text-fluid-xs font-medium text-dark/40"
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
                  <p className="text-red-600 text-fluid-xs">{error}</p>
                </div>
              );
            })}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
