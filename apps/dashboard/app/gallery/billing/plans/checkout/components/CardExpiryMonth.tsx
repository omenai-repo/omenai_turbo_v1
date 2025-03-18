import React, { useState } from "react";

interface MonthProps {
  onChange: (name: string, value: string) => void;
}

const ExpiryMonth: React.FC<MonthProps> = ({ onChange }) => {
  const [month, setMonth] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value.replace(/\D/g, ""); // Remove non-numeric characters
    setMonth(inputValue.slice(0, 2)); // Limit to 2 digits
    onChange("month", inputValue);
  };

  return (
    <div className="relative w-full ">
      <label className="text-[#858585] text-[13px]" htmlFor="card_name">
        Expiration month
      </label>
      <input
        type="text"
        name="month"
        placeholder="MM"
        value={month}
        maxLength={2}
        minLength={2}
        onChange={handleInputChange}
        className="disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-dark/30 focus:ring ring-1 border-0 ring-dark/20 outline-none focus:outline-none focus:ring-dark transition-all duration-200 ease-in-out text-xs font-medium h-[40px] p-5 sm:p-6 rounded-full w-full placeholder:text-xs placeholder:text-dark/40 "
      />
    </div>
  );
};

export default ExpiryMonth;
