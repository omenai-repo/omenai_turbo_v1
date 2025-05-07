"use client";
import { galleryProfileUpdate } from "@omenai/shared-state-store/src/gallery/gallery_profile_update/GalleryProfileUpdateStore";
import clsx from "clsx";
import { ChangeEvent, ReactNode } from "react";

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  rightComponent?: ReactNode;
  labelText: string;
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
    ...rest
  } = props;

  const { setProfileUpdateData } = galleryProfileUpdate();

  function handleChange(label: string, value: string) {
    setProfileUpdateData(label, value);
  }

  return (
    <div className="flex flex-col">
      <label htmlFor={id} className="text-fluid-xs text-dark">
        {label}
      </label>
      <div className={clsx("flex items-center justify-between py-1 px-1")}>
        <input
          type="text"
          disabled={
            labelText === "gallery" ||
            labelText === "email" ||
            labelText === "location"
          }
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            handleChange(labelText, e.target.value)
          }
          className={`w-full ${labelText === "email" && "text-dark/40"} ${
            labelText === "gallery" && "text-dark/40"
          } focus:ring ring-1 border-0 ring-dark/20 outline-none focus:outline-none focus:ring-dark transition-all duration-200 ease-in-out h-[35px] p-5 rounded-full w-full placeholder:text-fluid-xs placeholder:text-dark/40 `}
          {...rest}
        />
      </div>
    </div>
  );
};
