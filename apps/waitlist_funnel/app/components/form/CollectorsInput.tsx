import { CountryDropdown } from "react-country-region-selector";
import { AtelierInput } from "../AtelierInput";
import { AtelierSelect } from "../AtelierSelect";
import { KpiMetrics, WaitlistStateData } from "@omenai/shared-types";
import { ChangeEvent } from "react";

export const CollectorInputs = ({
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
      <AtelierSelect
        label="Collector Type"
        name="collector_type"
        required
        onChange={handleUpdateWaitlistData}
        value={waitlistData.collector_type ?? ""}
        options={[
          { value: "individual", label: "Individual / Enthusiast" },
          { value: "private", label: "Private Collection / Family Office" },
          { value: "institutional", label: "Institutional / Corporate" },
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AtelierInput
          label="Years Collecting"
          name="years_of_collecting"
          required
          type="number"
          value={waitlistData.years_of_collecting ?? ""}
          min={0}
          placeholder="e.g. 10"
          onChange={handleUpdateWaitlistData}
        />
        <AtelierSelect
          label="Buying Frequency"
          name="buying_frequency"
          required
          value={waitlistData.buying_frequency ?? ""}
          onChange={handleUpdateWaitlistData}
          options={[
            { value: "frequently", label: "Frequently (Monthly+)" },
            { value: "regularly", label: "Regularly (Quarterly)" },
            { value: "rarely", label: "Rarely / First time" },
          ]}
        />
      </div>
    </div>
  );
};
