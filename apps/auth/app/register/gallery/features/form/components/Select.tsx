"use client";
import { useGalleryAuthStore } from "@omenai/shared-state-store/src/auth/register/GalleryAuthStore";
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
  } = useGalleryAuthStore();

  const [errorList, setErrorList] = useState<string[]>([]);

  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    updateGallerySignupData(labelText, value);
    setIsFieldDirty(labelText as keyof typeof gallerySignupData, false);
  };

  return (
    <AnimatePresence key={`${currentGallerySignupFormIndex}-gallery`}>
      <motion.div
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ y: -100 }}
        transition={{ duration: 0.33 }}
        className="flex flex-col gap-2 xl:container"
      >
        <div className="flex flex-col gap-1">
          <label
            htmlFor={name}
            className="text-dark/80 font-normal text-[14px]"
          >
            {label}
          </label>
          <select
            value={(gallerySignupData as Record<string, any>)[labelText]}
            onChange={handleChange}
            required={required}
            className="border-0 ring-1 ring-dark/20 focus:ring text-xs focus:ring-dark px-6 py-2 sm:py-3 rounded-full "
          >
            {/* focus:ring ring-1 border-0 ring-dark/20 outline-none
            focus:outline-none focus:ring-dark transition-all duration-200
            ease-in-out h-[40px] p-5 sm:p-6 rounded-full w-full
            placeholder:text-dark/40 text-dark */}
            <option value="" className="text-dark/40">
              Select {labelText}
            </option>
            <>
              {items.map((item: any) => {
                return (
                  <option
                    key={item.code}
                    value={item.name}
                    className="px-3 py-5 my-5 font-normal text-xs sm:text-[14px] text-dark/40"
                  >
                    {item.name}
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
