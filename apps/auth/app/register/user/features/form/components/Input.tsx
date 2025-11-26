"use client";

import { validate } from "@omenai/shared-lib/validations/validatorGroup";
import { useIndividualAuthStore } from "@omenai/shared-state-store/src/auth/register/IndividualAuthStore";
import { IndividualSignupData, InputProps } from "@omenai/shared-types";
import { handleKeyPress } from "@omenai/shared-utils/src/disableSubmitOnEnter";
import { AnimatePresence, motion } from "framer-motion";
import { EyeOff, Eye, AlertCircle } from "lucide-react";
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
        className="w-full"
      >
        <div className="space-y-2">
          {/* Label */}
          <label
            htmlFor={labelText}
            className="block text-fluid-xxs font-normal text-gray-700"
          >
            {label}
          </label>

          {/* Input Container */}
          <div className="relative group">
            <input
              type={type === "password" ? (show ? "text" : type) : type}
              className={`w-full bg-transparent border border-dark/30 focus:border-dark outline-none focus:ring-0 rounded transition-all duration-300 text-fluid-xxs font-normal text-dark disabled:bg-dark/10 p-3 disabled:bg-gray-50 disabled:border-dark/20 disabled:text-slate-700 disabled:cursor-not-allowed
                
                ${
                  errorList.length > 0
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500/10"
                    : ""
                }
              `}
              placeholder={`${placeholder}`}
              disabled={disabled}
              onChange={handleChange}
              onKeyDown={handleKeyPress}
              name={labelText}
              required={true}
              value={(individualSignupData as Record<string, any>)[labelText]}
            />

            {/* Password Toggle */}
            {type === "password" && (
              <button
                type="button"
                onClick={() => setShow(!show)}
                className="
                  absolute right-3 top-1/2 -translate-y-1/2
                  p-1.5
                  text-dark
                  hover:text-dark/80
                  focus:outline-none
                  focus:text-dark/80
                  transition-colors duration-150
                "
                tabIndex={-1}
              >
                {show ? (
                  <EyeOff className="w-4 h-4" strokeWidth={2} />
                ) : (
                  <Eye className="w-4 h-4" strokeWidth={2} />
                )}
              </button>
            )}
          </div>

          {/* Error Messages */}
          {errorList.length > 0 && (
            <div className="space-y-1.5 animate-in slide-in-from-top-1">
              {errorList.map((error, index) => (
                <div
                  key={`${index}-error_list`}
                  className="flex items-center gap-2 text-red-600"
                >
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <p className="text-fluid-xxs">{error}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
