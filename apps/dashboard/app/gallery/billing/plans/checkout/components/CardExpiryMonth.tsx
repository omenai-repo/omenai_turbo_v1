import { Shield } from "lucide-react";
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
    <div className="relative w-full">
      <label
        className="block text-sm font-medium text-gray-600 mb-2"
        htmlFor="month"
      >
        Month
      </label>
      <div className="relative">
        <input
          name="month"
          type="text"
          required
          maxLength={4}
          placeholder="MM"
          onChange={handleInputChange}
          className="w-full h-12 px-4 pr-10 text-sm font-medium bg-white border rounded-xl focus:border-gray-900 focus:ring-4 focus:ring-gray-100 transition-all duration-200 placeholder:text-dark/30 outline-none"
        />
        <Shield className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-dark" />
      </div>
    </div>
  );
};

export default ExpiryMonth;
