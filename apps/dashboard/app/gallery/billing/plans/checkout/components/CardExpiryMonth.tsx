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
        className="h-[40px] border border-[#E0E0E0] text-[13px] placeholder:text-[#858585] placeholder:text-[13px] bg-white  w-full focus:border-none focus:ring-1 focus:ring-dark focus:outline-none"
      />
    </div>
  );
};

export default ExpiryMonth;
