import { Shield } from "lucide-react";
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
    <div className="relative w-full">
      <label
        className="block text-sm font-medium text-gray-600 mb-2"
        htmlFor="year"
      >
        Year
      </label>
      <div className="relative">
        <input
          name="year"
          type="number"
          required
          maxLength={4}
          placeholder="YYYY"
          onChange={handleInputChange}
          value={year}
          className="w-full h-12 px-4 pr-10 text-sm font-medium bg-white border rounded-xl focus:border-gray-900 focus:ring-4 focus:ring-gray-100 transition-all duration-200 placeholder:text-dark/30 outline-none"
        />
        <Shield className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-dark" />
      </div>
    </div>
  );
};

export default ExpiryYear;
