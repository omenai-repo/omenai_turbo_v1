import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Country, State, City } from "country-state-city";
import { Loader2 } from "lucide-react";
import { AddressTypes } from "@omenai/shared-types";
import {
  INPUT_CLASS,
  SELECT_CLASS,
} from "@omenai/shared-ui-components/components/styles/inputClasses";

interface AddressFormProps {
  initialData: AddressTypes;
  onSubmit: (data: AddressTypes) => void;
  onCancel: () => void;
  isSaving: boolean; // Renamed to reflect the single-step save/verify flow
}

export default function AddressForm({
  initialData,
  onSubmit,
  onCancel,
  isSaving,
}: AddressFormProps) {
  const [formData, setFormData] = useState<AddressTypes>(initialData);

  const countries = useMemo(() => Country.getAllCountries(), []);
  const states = useMemo(
    () => State.getStatesOfCountry(formData.countryCode),
    [formData.countryCode],
  );
  const cities = useMemo(
    () => City.getCitiesOfState(formData.countryCode, formData.stateCode),
    [formData.countryCode, formData.stateCode],
  );

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const isoCode = e.target.value;
    const countryData = countries.find((c) => c.isoCode === isoCode);
    setFormData((prev) => ({
      ...prev,
      country: countryData?.name || "",
      countryCode: isoCode,
      state: "",
      stateCode: "",
      city: "",
    }));
  };

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const isoCode = e.target.value;
    const stateData = states.find((s) => s.isoCode === isoCode);
    setFormData((prev) => ({
      ...prev,
      state: stateData?.name || "",
      stateCode: isoCode,
      city: "",
    }));
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, city: e.target.value }));
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSaveClick = () => {
    // Basic manual validation
    if (
      !formData.countryCode ||
      !formData.stateCode ||
      !formData.city ||
      !formData.address_line ||
      !formData.zip
    ) {
      return;
    }
    onSubmit(formData);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="p-6 border border-neutral-100 rounded -lg bg-white flex flex-col gap-6"
    >
      <div className="flex justify-between items-center border-b border-neutral-100 pb-3">
        <h3 className="text-md font-normal text-neutral-900">
          Update Pickup Location
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Country Select */}
        <div className="flex flex-col gap-1.5">
          <label className="text-fluid-xs font-normal text-neutral-700">
            Country of residence
          </label>
          <select
            value={formData.countryCode}
            onChange={handleCountryChange}
            className={SELECT_CLASS}
            required
          >
            <option value="" disabled>
              Select a country
            </option>
            {countries.map((c) => (
              <option key={c.isoCode} value={c.isoCode}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* State Select */}
        <div className="flex flex-col gap-1.5">
          <label className="text-fluid-xs font-normal text-neutral-700">
            State / Province
          </label>
          <select
            value={formData.stateCode}
            onChange={handleStateChange}
            disabled={!formData.countryCode}
            className={SELECT_CLASS}
            required
          >
            <option value="" disabled>
              Select a state
            </option>
            {states.map((s) => (
              <option key={s.isoCode} value={s.isoCode}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* City Select */}
        <div className="flex flex-col gap-1.5">
          <label className="text-fluid-xs font-normal text-neutral-700">
            City
          </label>
          <select
            value={formData.city}
            onChange={handleCityChange}
            disabled={!formData.stateCode}
            className={SELECT_CLASS}
            required
          >
            <option value="" disabled>
              Select a city
            </option>
            {cities.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Address Line & Postal Code Inputs */}
        <div className="flex flex-col gap-1.5">
          <label className="text-fluid-xs font-normal text-neutral-700">
            Address line
          </label>
          <input
            type="text"
            name="address_line"
            value={formData.address_line}
            onChange={handleTextChange}
            placeholder="e.g 79, example street"
            className={INPUT_CLASS}
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-fluid-xs font-normal text-neutral-700">
            Postal code
          </label>
          <input
            type="text"
            name="zip"
            value={formData.zip}
            onChange={handleTextChange}
            placeholder="Your region's postal code"
            className={INPUT_CLASS}
            required
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-neutral-100 mt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          className="px-5 py-2.5 text-fluid-xs font-normal text-neutral-700 hover:bg-neutral-100 rounded -sm transition-colors disabled:opacity-50"
        >
          Cancel
        </button>

        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          type="button"
          onClick={handleSaveClick}
          disabled={
            isSaving ||
            !formData.address_line ||
            !formData.city ||
            !formData.zip
          }
          className="flex items-center gap-2 px-5 py-2.5 text-fluid-xs font-normal text-white bg-green-600 hover:bg-green-700 rounded -sm transition-colors shadow-sm disabled:opacity-50"
        >
          {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
          {isSaving ? "Saving..." : "Save Pickup Address"}
        </motion.button>
      </div>
    </motion.div>
  );
}
