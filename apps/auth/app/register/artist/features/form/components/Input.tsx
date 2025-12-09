import { validate } from "@omenai/shared-lib/validations/validatorGroup";
import { useArtistAuthStore } from "@omenai/shared-state-store/src/auth/register/ArtistAuthStore";
import { AddressTypes, ArtistSignupData } from "@omenai/shared-types";
import { handleKeyPress } from "@omenai/shared-utils/src/disableSubmitOnEnter";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChangeEvent,
  HTMLInputTypeAttribute,
  useEffect,
  useState,
} from "react";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import { validatePasswordFields } from "@omenai/shared-lib/validations/validatePasswordFields";

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
  useEffect(() => {
    // Only run validation for password-related fields
    if (labelText !== "password" && labelText !== "confirmPassword") return;

    const errors = validatePasswordFields({
      password: artistSignupData.password,
      confirmPassword: artistSignupData.confirmPassword,
    });

    // Only show errors for the current field
    if (labelText === "password" && artistSignupData.password) {
      const passwordErrors = errors.filter(
        (err) =>
          err.toLowerCase().includes("password") &&
          !err.toLowerCase().includes("confirm")
      );
      if (passwordErrors.length > 0) {
        setErrorList(passwordErrors);
      } else {
        setErrorList([]);
      }
    }

    if (labelText === "confirmPassword" && artistSignupData.confirmPassword) {
      const confirmErrors = errors.filter(
        (err) =>
          err.toLowerCase().includes("match") ||
          err.toLowerCase().includes("confirm")
      );
      if (confirmErrors.length > 0) {
        setErrorList(confirmErrors);
      } else {
        setErrorList([]);
      }
    }
  }, [artistSignupData.password, artistSignupData.confirmPassword, labelText]);

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
