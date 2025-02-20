"use client";
import {
  ArtistCategorizationAlgorithmResult,
  ArtistCategorizationAnswerTypes,
} from "@omenai/shared-types";
import { ChangeEvent, FormEvent, useState } from "react";
import { calculateArtistRating } from "@omenai/shared-lib/algorithms/artistCategorization";
type FormTypes = {
  type_input: string;
  label: string;
  options?: string[];
  placeholder?: string;
  name: string;
  onchange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
};
export default function Form({
  type_input,
  label,
  options,
  placeholder,
  name,
  onchange,
}: FormTypes) {
  return (
    <>
      <div className="p-5 flex flex-col gap-2">
        <label className="text-xs font-medium">{label}</label>
        {type_input === "select" ? (
          <select
            required
            name={name}
            onChange={onchange}
            className="border-0 ring-1 ring-dark/20 focus:ring text-xs focus:ring-dark px-6 py-2 sm:py-3 rounded-full "
          >
            <option value="" className="text-dark/40">
              Select
            </option>
            {options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        ) : (
          <input
            onChange={onchange}
            required
            name={name}
            className="focus:ring ring-1 border-0 ring-dark/20 outline-none focus:outline-none focus:ring-dark transition-all duration-200 ease-in-out h-[40px] p-6 rounded-full placeholder:text-dark/30 placeholder:text-xs"
            type="number"
            placeholder="Enter a number"
          />
        )}
      </div>
    </>
  );
}
