"use client";
import { individualProfileUdateStore } from "@omenai/shared-state-store/src/individual/individual_profile_update/IndividualProfileUpdateStore";
import clsx from "clsx";
import { ChangeEvent } from "react";

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  labelText: string;
  value: string;
};
export const InputCard = ({ label, labelText, value }: Props) => {
  const { setProfileUpdateData } = individualProfileUdateStore();

  return (
    <div className="flex flex-col">
      <label
        htmlFor={labelText}
        className="text-fluid-xs font-normal text-dark"
      >
        {label}
      </label>
      <div className={clsx("flex items-center justify-between py-1 px-1")}>
        <input
          type="text"
          defaultValue={value}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setProfileUpdateData(labelText, e.target.value)
          }
          disabled={labelText === "email"}
          className="focus:ring ring-1 border-0 ring-dark/20 outline-none focus:outline-none focus:ring-dark transition-all duration-200 ease-in-out h-[35px] p-5 rounded-full placeholder:text-dark/40 w-full disabled:cursor-not-allowed disabled:bg-dark/10 disabled:text-[#858585]"
        />
      </div>
    </div>
  );
};
