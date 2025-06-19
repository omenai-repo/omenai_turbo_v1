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
      <label htmlFor={id} className="text-fluid-xs  text-dark">
        {label}
      </label>
      <div className={clsx("flex items-center justify-between py-1")}>
        <textarea
          rows={5}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
            handleChange(name, e.target.value)
          }
          className={
            "p-3 border border-[#E0E0E0] text-fluid-xs placeholder:text-dark font-light placeholder:text-fluid-xs bg-white  w-full focus:border-none focus:ring-1 focus:ring-dark focus:outline-none rounded-[10px]"
          }
          {...rest}
        />
      </div>
    </div>
  );
};
