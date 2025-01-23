import React, { useState } from "react";

interface CVVProps {
  onChange: (name: string, value: string) => void;
}

const CVV: React.FC<CVVProps> = ({ onChange }) => {
  const [cvv, setCvv] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value.replace(/\D/g, ""); // Remove non-numeric characters
    setCvv(inputValue.slice(0, 4)); // Limit to 4 digits
    onChange("cvv", inputValue);
  };

  return (
    <div className="relative w-full ">
      <label className="text-[#858585] text-[13px]" htmlFor="card_name">
        cvv
      </label>
      <input
        type="password"
        name="cvv"
        placeholder="CVV"
        value={cvv}
        maxLength={4}
        minLength={3}
        onChange={handleInputChange}
        className="w-full focus:ring ring-1 border-0 ring-dark/20 outline-none focus:outline-none focus:ring-dark transition-all duration-200 ease-in-out h-[40px] p-6 rounded-full placeholder:text-dark/40 placeholder:text-xs"
      />
    </div>
  );
};

export default CVV;
