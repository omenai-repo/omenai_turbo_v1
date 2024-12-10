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
        className="h-[40px] border border-[#E0E0E0] text-[13px] placeholder:text-[#858585] placeholder:text-[13px] bg-white  w-full focus:border-none focus:ring-1 focus:ring-dark focus:outline-none"
      />
    </div>
  );
};

export default ExpiryYear;
