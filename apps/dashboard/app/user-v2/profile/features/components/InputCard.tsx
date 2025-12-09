"use client";
import { individualProfileUdateStore } from "@omenai/shared-state-store/src/individual/individual_profile_update/IndividualProfileUpdateStore";
import { INPUT_CLASS } from "@omenai/shared-ui-components/components/styles/inputClasses";
import clsx from "clsx";
import { ChangeEvent } from "react";

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  labelText: string;
  value: string;
  disabled?: boolean;
  readonly?: boolean;
};
export const InputCard = ({
  label,
  labelText,
  value,
  disabled = false,
  readOnly = false,
}: Props) => {
  const { setProfileUpdateData } = individualProfileUdateStore();

  return (
    <div className="flex flex-col space-y-2">
      <label
        htmlFor={labelText}
        className="text-fluid-xxs font-medium text-dark"
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
          disabled={labelText === "email" || disabled}
          readOnly={readOnly}
          className={INPUT_CLASS}
        />
      </div>
    </div>
  );
};
