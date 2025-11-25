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
          defaultValue={defaultValue ?? ""}
          onChange={handleInputChange}
          className="
            w-full
            px-4
            py-3
            bg-white
            border border-slate-300
            rounded-md
            text-slate-900
            text-sm
            placeholder:text-slate-400
            transition-all duration-200
            focus:outline-none
            focus:border-[#0F172A]
            focus:ring-0
            hover:border-slate-400
            disabled:bg-slate-50
            disabled:text-slate-500
            disabled:border-slate-200
            disabled:cursor-not-allowed
          "
        />
      </div>
    </div>
  );
}
