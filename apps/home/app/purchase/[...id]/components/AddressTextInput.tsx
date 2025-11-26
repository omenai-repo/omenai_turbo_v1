import { orderStore } from "@omenai/shared-state-store/src/orders/ordersStore";
import { ChangeEvent, HTMLInputTypeAttribute } from "react";
import { INPUT_CLASS } from "@omenai/shared-ui-components/components/styles/inputClasses";
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
          className={INPUT_CLASS}
        />
      </div>
    </div>
  );
}
