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
        className="block font-mono text-[10px] uppercase tracking-widest text-neutral-500"
      >
        {label} {required && "*"}
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
          className={`
            w-full bg-white px-4 py-3
            font-sans text-sm text-dark
            border border-neutral-300 
            rounded-none
            placeholder:text-neutral-300
            focus:border-dark focus:ring-0 focus:outline-none
            disabled:bg-neutral-50 disabled:text-neutral-400
            transition-colors duration-200
          `}
        />
      </div>
    </div>
  );
}
