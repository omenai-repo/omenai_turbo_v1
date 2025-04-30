import { orderStore } from "@omenai/shared-state-store/src/orders/ordersStore";
import { ChangeEvent, HTMLInputTypeAttribute } from "react";

export default function AddressTextInput({
  placeholder,
  label,
  name,
  type,
  required,
  defaultValue,
  disabled,
}: {
  placeholder: string;
  label: string;
  name: string;
  type: HTMLInputTypeAttribute;
  required: boolean;
  defaultValue?: string | undefined;
  disabled?: boolean;
}) {
  const { setAddress } = orderStore();
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setAddress(name, e.target.value);
  };
  return (
    <div className="flex flex-col gap-1 my-4 px-2 w-full">
      <label htmlFor={name} className="text-gray-700 font-normal text-[14px]">
        {label}
      </label>
      <input
        disabled={disabled}
        type="text"
        placeholder={placeholder}
        required={required}
        onChange={handleInputChange}
        name={name}
        defaultValue={defaultValue !== undefined ? defaultValue : ""}
        className="disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-700/30 focus:ring ring-1 border-0 ring-dark/20 outline-none focus:outline-none focus:ring-dark transition-all duration-200 ease-in-out text-xs font-medium h-[35px] p-5 sm:p-6 rounded-full w-full placeholder:text-xs placeholder:text-gray-700/40 "
      />
    </div>
  );
}
