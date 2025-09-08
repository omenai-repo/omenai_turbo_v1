import { validate } from "@omenai/shared-lib/validations/validatorGroup";
import { useArtistAuthStore } from "@omenai/shared-state-store/src/auth/register/ArtistAuthStore";
import { AddressTypes, ArtistSignupData } from "@omenai/shared-types";
import { handleKeyPress } from "@omenai/shared-utils/src/disableSubmitOnEnter";
import { AnimatePresence, motion } from "framer-motion";
import { ChangeEvent, HTMLInputTypeAttribute, useState } from "react";
import { Eye, EyeOff, AlertCircle } from "lucide-react";

export type InputProps = {
  label: string;
  labelText: string;
  type: HTMLInputTypeAttribute;
  placeholder: string;
  disabled?: boolean;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  buttonType: "button" | "submit" | undefined;
  buttonText: "Continue" | "Submit" | undefined;
  onClick?: () => void;
};

export default function Input({
  label,
  labelText,
  type,
  placeholder,
  disabled = false,
  onChange,
}: InputProps) {
  const {
    artistSignupData,
    updateArtistSignupData,
    currentArtistSignupFormIndex,
    setIsFieldDirty,
    isFieldDirty,
  } = useArtistAuthStore();

  const [errorList, setErrorList] = useState<string[]>([]);

  const [show, setShow] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    updateArtistSignupData(e.target.name, e.target.value);
    setErrorList([]);

    const { success, errors }: { success: boolean; errors: string[] | [] } =
      validate(
        e.target.value,
        e.target.name,
        e.target.name === "confirmPassword"
          ? artistSignupData.password
          : undefined
      );
    if (!success) {
      setIsFieldDirty(
        e.target.name as keyof ArtistSignupData & AddressTypes,
        true
      );
      setErrorList(errors);
    } else {
      setErrorList([]);
      setIsFieldDirty(
        e.target.name as keyof ArtistSignupData & AddressTypes,
        false
      );
    }
  };

  return (
    <AnimatePresence key={`${currentArtistSignupFormIndex}-artist`}>
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
            className="block text-fluid-xs font-normal text-gray-700"
          >
            {label}
          </label>

          {/* Input Container */}
          <div className="relative group">
            <input
              type={type === "password" ? (show ? "text" : type) : type}
              className={`
                w-full h-12 px-4 pr-12
                bg-white
                border-2 border-dark/20
                rounded-md
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
              value={(artistSignupData as Record<string, any>)[labelText]}
            />

            {/* Password Toggle */}
            {type === "password" && (
              <button
                type="button"
                onClick={() => setShow(!show)}
                className="
                  absolute right-3 top-1/2 -translate-y-1/2
                  p-1.5
                  text-gray-400
                  hover:text-gray-600
                  focus:outline-none
                  focus:text-gray-600
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
                  <p className="text-fluid-xs">{error}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
