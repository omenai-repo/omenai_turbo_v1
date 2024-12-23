"use client";

import { getCardType } from "@omenai/shared-utils/src/cardTypeDetection";
import Image from "next/image";
import { useState } from "react";

interface CardNumberProps {
  onChange: (name: string, value: string) => void;
}

export default function CardNumber({ onChange }: CardNumberProps) {
  const [cardNumber, setCardNumber] = useState<number[]>([]);
  const [cardType, setCardType] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value.replace(/\s+/g, ""); // Remove all spaces
    const numbersOnly = input.replace(/\D/g, ""); // Remove non-numeric characters

    const newCardNumber = numbersOnly.split("").map(Number);
    setCardNumber(newCardNumber.slice(0, 25)); // Limit to 16 digits

    const cardNumberString = newCardNumber.join("");
    const detectedCardType = getCardType(cardNumberString);
    setCardType(detectedCardType);

    const isValid = validateCardNumber(cardNumberString);
    setError(isValid ? null : "Invalid card number");
    onChange("card", cardNumberString);
  };

  // ... card type detection logic (getCardType function)

  const validateCardNumber = (cardNumber: string): boolean => {
    return !isNaN(Number(cardNumber));
  };

  const formattedCardNumber = cardNumber.reduce((acc, digit, index) => {
    return index % 4 === 0 ? acc + " " + digit : acc + digit;
  }, "");

  // ... card type detection logic (getCardType function)

  return (
    <div>
      <div className="relative w-full ">
        <label className="text-[#858585] text-[13px]" htmlFor="card_number">
          Card number
        </label>
        <div className="w-auto relative">
          <input
            onChange={handleInputChange}
            name="card_number"
            type="text"
            required
            value={formattedCardNumber}
            maxLength={24} // Limit input length to 19 characters
            placeholder="1234 1234 1234 1234"
            className="h-[40px] border border-[#E0E0E0] text-xs placeholder:text-[#858585] placeholder:text-xs bg-white  w-full focus:border-none focus:ring-1 focus:ring-dark focus:outline-none"
          />

          {cardType !== null && (
            <div className="h-[40px] w-fit absolute top-0 right-3 grid place-items-center">
              <Image
                src={`/icons/${cardType.toLowerCase()}.png`}
                alt={`${cardType} logo`}
                width={36}
                height={12}
                className=""
              />
            </div>
          )}
        </div>

        {error && (
          <span className="error-message text-[13px] text-red-600">
            {error}
          </span>
        )}
      </div>
    </div>
  );
}
