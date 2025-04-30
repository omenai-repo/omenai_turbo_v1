"use client";
import { galleryProfileUpdate } from "@omenai/shared-state-store/src/gallery/gallery_profile_update/GalleryProfileUpdateStore";
import clsx from "clsx";
import { ChangeEvent, ReactNode } from "react";

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  rightComponent?: ReactNode;
  labelText: string;
  disabled: boolean;
};
export const InputCard = (props: Props) => {
  const {
    label,
    className,
    labelText,
    id,
    onFocus,
    onBlur,
    rightComponent,
    disabled,
    ...rest
  } = props;

  const { setProfileUpdateData } = galleryProfileUpdate();

  function handleChange(label: string, value: string) {
    setProfileUpdateData(label, value);
  }

  return (
    <div className="flex flex-col w-[500px] space-y-2">
      <label htmlFor={id} className="text-xs text-gray-700">
        {label}
      </label>
      <div className={clsx("flex items-center justify-between py-1 px-1")}>
        <input
          type="text"
          disabled={disabled}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            handleChange(labelText, e.target.value)
          }
          className={`w-full text-xs text-dark focus:ring ring-1 border-0 ring-dark/20 outline-none focus:outline-none focus:ring-dark transition-all duration-200 ease-in-out h-[35px] p-5 rounded-full placeholder:text-xs placeholder:text-gray-700/40 disabled:cursor-not-allowed disabled:text-dark/10`}
          {...rest}
        />
      </div>
    </div>
  );
};
