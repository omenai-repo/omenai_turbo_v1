import React, { useEffect, useRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const AtelierInput = ({
  label,
  className,
  name,
  onChange,
  value,
  ...props
}: InputProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  // FORCE SYNC: Check if browser autofilled without firing React's onChange
  useEffect(() => {
    const checkAutofill = () => {
      const input = inputRef.current;
      if (!input || !onChange) return;

      // If the DOM has a value (autofilled) but React state (value) is empty
      if (input.value && input.value !== value) {
        // Manually trigger the React change handler
        const event = {
          target: input,
          currentTarget: input,
          type: "change",
          bubbles: true,
        } as React.ChangeEvent<HTMLInputElement>;

        onChange(event);
      }
    };

    // Check immediately and after a short delay (for slower browser autofills)
    checkAutofill();
    const timer = setTimeout(checkAutofill, 500);
    return () => clearTimeout(timer);
  }, [value, onChange]); // Re-run if value prop changes (to catch sync mismatches)

  return (
    <div className="flex flex-col gap-2 w-full group relative">
      <label
        htmlFor={name} // Link label to input for accessibility & autofill confidence
        className="font-sans text-[10px] uppercase tracking-[0.2em] text-neutral-500"
      >
        {label} {props.required && "*"}
      </label>

      <input
        ref={inputRef}
        id={name} // Browser autofill loves IDs
        name={name}
        value={value}
        onChange={onChange}
        {...props}
        className={`
          w-full rounded-none
          border-b border-neutral-300 bg-transparent py-3 
          font-sans text-sm text-black font-medium
          placeholder:text-neutral-400
          focus:border-black focus:outline-none focus:ring-0
          transition-colors
          
          /* AUTOFILL STYLING FIX */
          /* Removes the ugly Chrome yellow background, keeping it "Atelier" transparent */
          autofill:bg-transparent
          [-webkit-autofill]:shadow-[0_0_0_30px_white_inset_!important]
          [-webkit-autofill]:text-fill-color-black
          
          ${className || ""}
        `}
      />
    </div>
  );
};
