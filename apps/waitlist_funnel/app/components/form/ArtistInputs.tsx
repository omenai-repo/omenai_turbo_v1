import React, { ChangeEvent } from "react";

import { CountryDropdown } from "react-country-region-selector";
import { AtelierInput } from "../AtelierInput";
import { AtelierSelect } from "../AtelierSelect";
import { KpiMetrics, WaitlistStateData } from "@omenai/shared-types";

export const ArtistInputs = ({
  waitlistData,
  setWaitlistData,
}: {
  waitlistData: WaitlistStateData;
  setWaitlistData: React.Dispatch<React.SetStateAction<WaitlistStateData>>;
}) => {
  const handleUpdateWaitlistData = (
    e: ChangeEvent<HTMLSelectElement | HTMLInputElement>,
  ) => {
    const { name, value } = e.target;

    // Debugging: Ensure this logs when you select an item
    console.log(`Updating ${name} to ${value}`);

    setWaitlistData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCountrySelect = (name: string, value: string) => {
    setWaitlistData((prev) => ({ ...prev, country: value }));
  };
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AtelierInput
          label="Full Name"
          name="name"
          required
          type="text"
          value={waitlistData.name}
          placeholder="e.g. Wangechi Mutu"
          onChange={handleUpdateWaitlistData}
          autoComplete="name"
        />
        <AtelierInput
          label="Email Address"
          name="email"
          required
          type="email"
          value={waitlistData.email}
          placeholder="artist@studio.com"
          onChange={handleUpdateWaitlistData}
          autoComplete="email"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Using a library for reliable country data is highly recommended */}
        <div className="flex flex-col gap-2 w-full">
          <label className="font-sans text-[10px] uppercase tracking-[0.2em] text-neutral-500">
            Country of Residence *
          </label>
          <CountryDropdown
            name="country"
            value={waitlistData.country}
            onChange={(val: string, event: React.SyntheticEvent<HTMLElement>) =>
              handleCountrySelect("country", val)
            }
            className="w-full appearance-none border-b border-neutral-300 bg-transparent py-3 font-sans focus:ring-0 text-sm text-dark focus:border-black focus:outline-none transition-colors rounded-none"
          />
        </div>
        {/* Using text input for language, could be a complex select in future */}
        <AtelierInput
          label="Preferred Language"
          name="language"
          required
          type="text"
          onChange={handleUpdateWaitlistData}
          value={waitlistData.language}
          placeholder="e.g. English, French, Swahili"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AtelierInput
          label="Age"
          name="age"
          required
          type="number"
          min={16}
          onChange={handleUpdateWaitlistData}
          value={waitlistData.age ?? ""}
          placeholder="25"
        />
        <AtelierInput
          label="Years of Practice"
          name="years_of_practice"
          required
          type="number"
          min={0}
          onChange={handleUpdateWaitlistData}
          value={waitlistData.years_of_practice ?? ""}
          placeholder="5"
        />
      </div>

      <AtelierSelect
        label="Formal Art Education"
        name="formal_education"
        required
        onChange={handleUpdateWaitlistData}
        value={waitlistData.formal_education ?? ""}
        options={[
          { value: "degree", label: "Yes, degree/diploma holder" },
          { value: "workshops", label: "Some formal training/workshops" },
          { value: "self-taught", label: "No, self-taught" },
        ]}
      />
    </div>
  );
};
