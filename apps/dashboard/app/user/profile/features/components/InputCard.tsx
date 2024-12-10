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
      <label htmlFor={labelText} className="text-xs font-normal text-dark">
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
          className="focus:ring-0 border disabled:cursor-not-allowed disabled:bg-[#fafafa] w-full disabled:text-[#e0e0e0] h-[40px] px-4 border-dark/20  text-xs focus:border-dark focus:ring-dark focus:outline-none placeholder:text-xs"
        />
      </div>
    </div>
  );
};
