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

    // Debugging: Ensure this logs when you select an item
    console.log(`Updating ${name} to ${value}`);

    setWaitlistData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCountrySelect = (value: string) => {
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
          placeholder="e.g. Jean Pigozzi"
          value={waitlistData.name}
          onChange={handleUpdateWaitlistData}
          autoComplete="name"
        />
        <AtelierInput
          label="Email Address"
          name="email"
          required
          type="email"
          value={waitlistData.email}
          placeholder="collector@office.com"
          onChange={handleUpdateWaitlistData}
          autoComplete="email"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-2 w-full">
          <label className="font-sans text-[10px] uppercase tracking-[0.2em] text-neutral-500">
            Country of Residence *
          </label>
          <CountryDropdown
            value={waitlistData.country}
            onChange={(val: string, event: React.SyntheticEvent<HTMLElement>) =>
              handleCountrySelect(val)
            }
            className="w-full appearance-none border-b border-neutral-300 bg-transparent py-3 font-sans focus:ring-0 text-sm text-dark focus:border-black focus:outline-none transition-colors rounded-none"
          />
        </div>
        <AtelierInput
          label="Preferred Language"
          name="language"
          required
          type="text"
          value={waitlistData.language}
          placeholder="e.g. English"
          onChange={handleUpdateWaitlistData}
        />
      </div>

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
