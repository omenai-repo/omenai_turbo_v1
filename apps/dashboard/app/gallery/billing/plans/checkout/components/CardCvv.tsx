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
        className="h-[40px] border border-[#E0E0E0] text-[13px] placeholder:text-[#858585] placeholder:text-[13px] bg-white  w-full focus:border-none focus:ring-1 focus:ring-dark focus:outline-none"
      />
    </div>
  );
};

export default CVV;
