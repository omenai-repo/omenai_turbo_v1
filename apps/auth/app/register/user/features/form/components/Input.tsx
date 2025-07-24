"use client";

import { validate } from "@omenai/shared-lib/validations/validatorGroup";
import { useIndividualAuthStore } from "@omenai/shared-state-store/src/auth/register/IndividualAuthStore";
import { IndividualSignupData, InputProps } from "@omenai/shared-types";
import { handleKeyPress } from "@omenai/shared-utils/src/disableSubmitOnEnter";
import { AnimatePresence, motion } from "framer-motion";
import { ChangeEvent, useState } from "react";
import { MdError } from "react-icons/md";
import { PiEyeSlashThin, PiEyeThin } from "react-icons/pi";

export default function Input({
  label,
  labelText,
  type,
  placeholder,
  disabled = false,
  id,
}: InputProps) {
  const { individualSignupData, updateSignUpData, setIsFieldDirty } =
    useIndividualAuthStore();

  const [errorList, setErrorList] = useState<string[]>([]);
  const [show, setShow] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    updateSignUpData(e.target.name, e.target.value);
    setErrorList([]);
    const { success, errors }: { success: boolean; errors: string[] | [] } =
      validate(
        e.target.value,
        e.target.name,
        e.target.name === "confirmPassword"
          ? individualSignupData.password
          : undefined
      );

    console.log(success);
    if (!success) {
      setIsFieldDirty(e.target.name as keyof IndividualSignupData, true);
      setErrorList(errors);
    } else {
      setIsFieldDirty(e.target.name as keyof IndividualSignupData, false);
      setErrorList([]);
    }
  };

  return (
    <AnimatePresence key={`${id}-individual`}>
      <motion.div
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ y: -100 }}
        transition={{ duration: 0.33 }}
        className="flex flex-col gap-y-2 w-full"
      >
        <label
          htmlFor={labelText}
          className="text-[#858585] text-fluid-xxs font-normal"
        >
          {label}
        </label>
        <div className="w-full relative">
          <input
            type={type === "password" ? (show ? "text" : type) : type}
            className="disabled:cursor-not-allowed disabled:bg-dark/10 focus:ring ring-1 border-0 ring-dark/20 outline-none focus:outline-none focus:ring-dark transition-all duration-200 ease-in-out h-[35px] p-5 rounded-xl w-full text-fluid-xxs placeholder:text-fluid-xs placeholder:text-dark/40 placeholder:font-medium font-medium"
            placeholder={`${placeholder}`}
            disabled={disabled}
            onChange={handleChange}
            onKeyDown={handleKeyPress}
            name={labelText}
            value={(individualSignupData as Record<string, any>)[labelText]}
          />
          {type === "password" && (
            <div className="absolute top-2 sm:top-4 right-4 w-fit cursor-pointer">
              {show ? (
                <PiEyeSlashThin
                  className="text-fluid-md"
                  onClick={() => setShow(false)}
                />
              ) : (
                <PiEyeThin
                  className="text-fluid-md"
                  onClick={() => setShow(true)}
                />
              )}
            </div>
          )}
        </div>
        {errorList.length > 0 &&
          errorList.map((error, index) => {
            return (
              <div
                key={`${index}-error_list`}
                className="flex items-center gap-x-2"
              >
                <MdError className="text-red-600" />
                <p className="text-red-600 text-fluid-xxs sm:text-fluid-xs">
                  {error}
                </p>
              </div>
            );
          })}
      </motion.div>
    </AnimatePresence>
  );
}
