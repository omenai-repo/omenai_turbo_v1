import { validate } from "@omenai/shared-lib/validations/validatorGroup";

import { handleKeyPress } from "@omenai/shared-utils/src/disableSubmitOnEnter";
import { AnimatePresence, motion } from "framer-motion";
import { ChangeEvent, HTMLInputTypeAttribute, useState } from "react";
import { AlertCircle } from "lucide-react";
import { AddressTypes } from "@omenai/shared-types";

export type InputProps = {
  label: string;
  labelText: string;
  type: HTMLInputTypeAttribute;
  placeholder: string;
  disabled?: boolean;
  onChange: React.Dispatch<React.SetStateAction<AddressTypes>>;
  buttonType: "button" | "submit" | undefined;
  buttonText: "Continue" | "Submit" | undefined;
  onClick?: () => void;
  address: AddressTypes;
};

export default function Input({
  label,
  labelText,
  type,
  placeholder,
  disabled = false,
  onChange,
  address,
}: InputProps) {
  const [errorList, setErrorList] = useState<string[]>([]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange((prev) => {
      return { ...prev, [e.target.name]: e.target.value };
    });

    setErrorList([]);

    const { success, errors }: { success: boolean; errors: string[] | [] } =
      validate(e.target.value, e.target.name);
    if (!success) {
      setErrorList(errors);
    } else {
      setErrorList([]);
    }
  };

  return (
    <div className="w-full">
      <div className="space-y-2">
        {/* Label */}
        <label
          htmlFor={labelText}
          className="block text-fluid-xs font-normal text-gray-700"
        >
          {label}
        </label>

        {/* Input Container */}
        <div className="relative group">
          <input
            type={type}
            className={`
                w-full h-12 px-4 pr-12
                bg-white
                border-2 border-dark/20
                rounded
                text-fluid-xs text-dark
                placeholder:text-dark/40
                transition-all duration-200 ease-in-out
                hover:border-dark/30
                focus:border-dark
                focus:outline-none
                focus:ring-4
                focus:ring-dark/5
                disabled:bg-gray-50
                disabled:border-dark/20
                disabled:text-gray-500
                disabled:cursor-not-allowed
                
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
            value={(address as Record<string, any>)[labelText]}
          />
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
                <p className="text-fluid-xs">{error}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
