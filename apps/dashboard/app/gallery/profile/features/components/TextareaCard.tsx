"use client";
import { galleryProfileUpdate } from "@omenai/shared-state-store/src/gallery/gallery_profile_update/GalleryProfileUpdateStore";
import clsx from "clsx";
import { ChangeEvent } from "react";

type Props = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  name: string;
};
export const TextareaCard = (props: Props) => {
  const { label, className, name, id, onFocus, onBlur, ...rest } = props;

  const { setProfileUpdateData } = galleryProfileUpdate();

  function handleChange(label: string, value: string) {
    setProfileUpdateData(label, value);
  }

  return (
    <div className="flex flex-col">
      <label htmlFor={id} className="text-xs  text-dark">
        {label}
      </label>
      <div className={clsx("flex items-center justify-between py-1")}>
        <textarea
          rows={8}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
            handleChange(name, e.target.value)
          }
          className={clsx(
            "disabled:cursor-not-allowed border px-2 ring-0 text-xs text-dark border-[#E0E0E0] w-full py-2 focus:border-none focus:ring-dark placeholder:font-light placeholder:text-xs placeholder:text-dark ",
            className
          )}
          {...rest}
        />
      </div>
    </div>
  );
};
