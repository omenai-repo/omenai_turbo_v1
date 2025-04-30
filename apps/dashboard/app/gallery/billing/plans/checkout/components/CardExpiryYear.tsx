import React, { useState } from "react";

interface YearProps {
  onChange: (name: string, value: string) => void;
}

const ExpiryYear: React.FC<YearProps> = ({ onChange }) => {
  const [year, setYear] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value.replace(/\D/g, ""); // Remove non-numeric characters
    setYear(inputValue.slice(0, 4)); // Limit to 4 digits
    onChange("year", inputValue);
  };

  return (
    <div className="relative w-full ">
      <label className="text-[#858585] text-[13px]" htmlFor="card_name">
        Expiration year
      </label>
      <input
        type="text"
        name="year"
        placeholder="YYYY"
        value={year}
        maxLength={4}
        minLength={4}
        onChange={handleInputChange}
        className="disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-dark/30 focus:ring ring-1 border-0 ring-dark/20 outline-none focus:outline-none focus:ring-dark transition-all duration-200 ease-in-out text-fluid-xxs font-medium h-[35px] p-5 rounded-full w-full placeholder:text-fluid-xxs placeholder:text-dark/40 "
      />
    </div>
  );
};

export default ExpiryYear;
