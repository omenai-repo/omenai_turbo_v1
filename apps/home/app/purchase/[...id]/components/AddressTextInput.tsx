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
    <div className="w-full space-y-2">
      <label
        htmlFor={name}
        className="block text-sm font-medium text-slate-700"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <div className="relative">
        <input
          id={name}
          name={name}
          type={type || "text"}
          disabled={disabled}
          required={required}
          placeholder={placeholder}
          onChange={handleInputChange}
          defaultValue={defaultValue !== undefined ? defaultValue : ""}
          className="
        w-full
        px-4
        py-3
        bg-white
        border
        border-slate-300
        rounded
        text-slate-900
        text-sm
        font-normal
        placeholder:text-slate-400
        placeholder:text-sm
        transition-all
        duration-200
        focus:border-slate-900
        focus:ring-2
        focus:ring-slate-900
        focus:ring-offset-0
        focus:outline-none
        disabled:bg-slate-50
        disabled:text-slate-500
        disabled:cursor-not-allowed
        disabled:border-slate-200
      "
        />
      </div>
    </div>
  );
}
