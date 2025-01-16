import { validate } from "@omenai/shared-lib/validations/validatorGroup";
import { useGalleryAuthStore } from "@omenai/shared-state-store/src/auth/register/GalleryAuthStore";
import { handleKeyPress } from "@omenai/shared-utils/src/disableSubmitOnEnter";
import { AnimatePresence, motion } from "framer-motion";
import { ChangeEvent, HTMLInputTypeAttribute, useState } from "react";
import { MdError, MdOutlineArrowForward } from "react-icons/md";
import { PiEyeSlashThin, PiEyeThin } from "react-icons/pi";
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
    gallerySignupData,
    updateGallerySignupData,
    currentGallerySignupFormIndex,
    setIsFieldDirty,
  } = useGalleryAuthStore();

  const [errorList, setErrorList] = useState<string[]>([]);

  const [show, setShow] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    updateGallerySignupData(e.target.name, e.target.value);
    setErrorList([]);
    const { success, errors }: { success: boolean; errors: string[] | [] } =
      validate(
        e.target.value,
        e.target.name,
        e.target.name === "confirmPassword"
          ? gallerySignupData.password
          : undefined
      );
    if (!success) {
      setIsFieldDirty(true);
      setErrorList(errors);
    } else {
      setErrorList([]);
      setIsFieldDirty(false);
    }
  };

  return (
    <AnimatePresence key={`${currentGallerySignupFormIndex}-gallery`}>
      <motion.div
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ y: -100 }}
        transition={{ duration: 0.33 }}
        className="flex flex-col gap-2 w-full xl:container"
      >
        <label htmlFor={labelText} className="text-[#858585] text-[14px]">
          {label}
        </label>
        <div className="w-full relative">
          <input
            type={type === "password" ? (show ? "text" : type) : type}
            className="focus:ring ring-1 border-0 ring-dark/20 outline-none focus:outline-none focus:ring-dark transition-all duration-200 ease-in-out h-[40px] p-6 rounded-full w-full placeholder:text-dark/40 "
            placeholder={`e.g ${placeholder}`}
            disabled={disabled}
            onChange={handleChange}
            onKeyDown={handleKeyPress}
            name={labelText}
            value={(gallerySignupData as Record<string, any>)[labelText]}
          />
          {type === "password" && (
            <div className="absolute top-4 right-4 w-fit cursor-pointer">
              {show ? (
                <PiEyeSlashThin
                  className="text-md"
                  onClick={() => setShow(false)}
                />
              ) : (
                <PiEyeThin className="text-md" onClick={() => setShow(true)} />
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
                <p className="text-red-600 text-[14px]">{error}</p>
              </div>
            );
          })}
      </motion.div>
    </AnimatePresence>
  );
}
