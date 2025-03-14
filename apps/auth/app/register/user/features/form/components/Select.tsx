"use client";
import { country_and_states } from "@omenai/shared-json/src/countryAndStateList";
import { useGalleryAuthStore } from "@omenai/shared-state-store/src/auth/register/GalleryAuthStore";
import { useIndividualAuthStore } from "@omenai/shared-state-store/src/auth/register/IndividualAuthStore";
import {
  GallerySignupData,
  AddressTypes,
  IndividualSignupData,
} from "@omenai/shared-types";
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
    individualSignupData,
    currentSignupFormIndex,
    updateSignUpData,
    setIsFieldDirty,
    isFieldDirty,
  } = useIndividualAuthStore();

  const option_items =
    labelText === "country"
      ? items
      : labelText === "state"
        ? country_and_states.find(
            (country) => country.country === individualSignupData.country
          )?.states || []
        : [];
  const [errorList, setErrorList] = useState<string[]>([]);

  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const selectedCode =
      e.target.options[e.target.selectedIndex].getAttribute("data-code");

    updateSignUpData(labelText, value);
    labelText === "country" &&
      updateSignUpData("countryCode", selectedCode as string);
    setIsFieldDirty(
      labelText as keyof IndividualSignupData & AddressTypes,
      false
    );
  };

  return (
    <AnimatePresence key={`${currentSignupFormIndex}-gallery`}>
      <motion.div
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ y: -100 }}
        transition={{ duration: 0.33 }}
        className="flex flex-col gap-y-1 xl:container"
      >
        <div className="flex flex-col gap-1">
          <label htmlFor={name} className="text-dark/80 font-normal text-xs">
            {label}
          </label>
          <select
            value={(individualSignupData as Record<string, any>)[labelText]}
            onChange={handleChange}
            required={required}
            disabled={
              labelText === "state" && individualSignupData.country === ""
            }
            className="border-0 ring-1 ring-dark/20 focus:ring text-xs font-medium disabled:cursor-not-allowed disabled:bg-gray-400 focus:ring-dark px-6 py-2 sm:py-3 rounded-full placeholder:text-xs placeholder:text-dark/40"
          >
            <option value="" className="text-dark/40">
              Select {labelText}
            </option>
            <>
              {labelText === "country" &&
                option_items.map((item: any) => {
                  return (
                    <option
                      key={item.code}
                      value={item.name}
                      data-code={item.code}
                      className="px-3 py-5 my-5 text-xs font-medium text-dark/40"
                    >
                      {item.name}
                    </option>
                  );
                })}
              {labelText === "state" &&
                option_items.map((item: any) => {
                  return (
                    <option
                      key={item}
                      value={item}
                      className="px-3 py-5 my-5 text-xs font-medium text-dark/40"
                    >
                      {item}
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
