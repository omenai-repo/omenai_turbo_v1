import { OrderArtworkExhibitionStatus } from "@omenai/shared-types";
import { TEXTAREA_CLASS } from "@omenai/shared-ui-components/components/styles/inputClasses";
import DateTimePickerComponent from "./DateTimePicker";
import { Dispatch, SetStateAction } from "react";
import { CheckCircle2, Circle } from "lucide-react";

interface ExhibitionStatusSectionProps {
  exhibitionStatus: OrderArtworkExhibitionStatus | null;
  onStatusChange: Dispatch<SetStateAction<OrderArtworkExhibitionStatus | null>>;
  specialInstructions: string;
  onInstructionsChange: (val: string) => void;
}

export default function ExhibitionStatusSection({
  exhibitionStatus,
  onStatusChange,
  specialInstructions,
  onInstructionsChange,
}: ExhibitionStatusSectionProps) {
  const isExhibition = exhibitionStatus?.is_on_exhibition ?? false;

  const handleToggle = (value: boolean) => {
    if (!value) {
      onStatusChange(null);
    } else {
      onStatusChange({
        is_on_exhibition: true,
        exhibition_end_date: "",
        status: "pending",
      });
    }
  };

  return (
    <div className="bg-white rounded shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] border border-slate-100 p-6 md:p-8 space-y-8">
      {/* Selection Area */}
      <div>
        <div className="mb-4">
          <h3 className="text-base font-semibold text-slate-900">
            Logistics & Availability
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Is this artwork currently on display at an exhibition?
          </p>
        </div>

        {/* Custom Visual Toggle Cards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            type="button"
            onClick={() => handleToggle(false)}
            className={`relative flex items-center gap-3 p-4 rounded-xl border transition-all text-left ${
              !isExhibition
                ? "bg-slate-50 border-dark ring-1 ring-dark"
                : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
            }`}
          >
            {!isExhibition ? (
              <CheckCircle2 className="w-5 h-5 text-dark shrink-0" />
            ) : (
              <Circle className="w-5 h-5 text-slate-300 shrink-0" />
            )}
            <div>
              <p
                className={`text-sm font-semibold ${!isExhibition ? "text-dark" : "text-slate-700"}`}
              >
                No, it's ready
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Available for immediate pickup
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleToggle(true)}
            className={`relative flex items-center gap-3 p-4 rounded-xl border transition-all text-left ${
              isExhibition
                ? "bg-amber-50/30 border-amber-500 ring-1 ring-amber-500"
                : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
            }`}
          >
            {isExhibition ? (
              <CheckCircle2 className="w-5 h-5 text-amber-600 shrink-0" />
            ) : (
              <Circle className="w-5 h-5 text-slate-300 shrink-0" />
            )}
            <div>
              <p
                className={`text-sm font-semibold ${isExhibition ? "text-amber-900" : "text-slate-700"}`}
              >
                Yes, on display
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Requires delayed scheduling
              </p>
            </div>
          </button>
        </div>

        {/* Dynamic Date Picker */}
        {isExhibition && (
          <div className="pt-2">
            <DateTimePickerComponent handleDateTimeChange={onStatusChange} />
          </div>
        )}
      </div>

      {/* Special Instructions */}
      <div className="border-t border-slate-100 pt-6">
        <label
          htmlFor="specialInstructions"
          className="block text-sm font-semibold text-slate-800 mb-2"
        >
          Special Instructions{" "}
          <span className="text-slate-400 font-normal">(Optional)</span>
        </label>
        <textarea
          value={specialInstructions}
          onChange={(e) => onInstructionsChange(e.target.value)}
          name="specialInstructions"
          placeholder="Add gate codes, handling requirements, or specific pickup notes..."
          rows={3}
          className={`${TEXTAREA_CLASS} !rounded-xl !border-slate-200 focus:!border-dark focus:!ring-dark/20 resize-none py-3 px-4 text-sm shadow-sm transition-all`}
        />
      </div>
    </div>
  );
}
