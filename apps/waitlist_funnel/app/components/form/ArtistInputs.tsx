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

    setWaitlistData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
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
