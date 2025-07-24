"use client";

import { getCardType } from "@omenai/shared-utils/src/cardTypeDetection";
import { CreditCard } from "lucide-react";
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
    <div className="relative w-full">
      <label
        className="block text-sm font-medium text-gray-600 mb-2"
        htmlFor="card_number"
      >
        Card number
      </label>
      <div className="relative">
        <input
          name="card_number"
          type="text"
          required
          placeholder="1234 5678 9012 3456"
          onChange={handleInputChange}
          className="w-full h-12 px-4 pr-12 text-sm font-medium bg-white border rounded-xl focus:border-gray-900 focus:ring-4 focus:ring-gray-100 transition-all duration-200 placeholder:text-dark/30 outline-none"
        />
        <CreditCard className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-dark" />

        {cardType !== null && (
          <div className="h-[35px] w-fit absolute top-0 right-3 grid place-items-center">
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
        <span className="error-message text-[13px] text-red-600">{error}</span>
      )}
    </div>
  );
}
