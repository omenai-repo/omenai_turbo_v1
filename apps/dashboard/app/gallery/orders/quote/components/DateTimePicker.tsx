import { DatePickerInput, TimeInput } from "@mantine/dates";
import { OrderArtworkExhibitionStatus } from "@omenai/shared-types";
import { toUTCDate } from "@omenai/shared-utils/src/toUtcDate";
import { Dispatch, SetStateAction, useState, useRef, useEffect } from "react";
import { CalendarDays, Clock, Info } from "lucide-react";
import { ActionIcon } from "@mantine/core";

export default function DateTimePickerComponent({
  handleDateTimeChange,
}: {
  handleDateTimeChange: Dispatch<
    SetStateAction<OrderArtworkExhibitionStatus | null>
  >;
}) {
  const now = toUTCDate(new Date());
  // 6 months from now cap
  const maxDate = new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000);

  // Separate states for Date object and Time string
  const [dateVal, setDateVal] = useState<Date | null | string>(null);
  const [timeVal, setTimeVal] = useState<string>("");
  const timeInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Only proceed if both date and time are selected
    if (dateVal && timeVal) {
      // 1. Create a clone of the selected date to avoid mutating state directly
      const combinedDate = new Date(dateVal);

      // 2. Parse the HH:mm string from the TimeInput
      const [hours, minutes] = timeVal.split(":").map(Number);

      // 3. Set the time on the date object (using local time methods)
      // We also reset seconds and milliseconds to 0 for precision
      combinedDate.setHours(hours, minutes, 0, 0);

      // 4. Convert to ISO String (UTC)
      // Standard .toISOString() returns "...Z", so we replace it with "+00:00" as requested
      const isoString = combinedDate.toISOString().replace("Z", "+00:00");

      // 5. Update Parent State
      handleDateTimeChange({
        is_on_exhibition: true,
        exhibition_end_date: isoString,
        status: "pending",
      });
    } else {
      // Optional: Handle case where inputs are incomplete (e.g., set parent state to null)
      // handleDateTimeChange(null);
    }
  }, [dateVal, timeVal, handleDateTimeChange]);

  // Shared Styles for consistency
  const pickerClasses = {
    label: "text-xs font-semibold text-gray-700 mb-1",
    input:
      "h-[42px] text-sm text-dark font-medium border-gray-300 focus:border-dark focus:ring-1 focus:ring-dark rounded-md shadow-sm",
    section: "text-gray-400",
  };

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Context Banner */}
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex items-start gap-3">
        <Info className="text-blue-500 shrink-0 mt-0.5" size={16} />
        <p className="text-xs text-blue-800 leading-relaxed">
          <span className="font-semibold block mb-0.5">
            Automated Logistics
          </span>
          Select when the exhibition ends. A shipment request will be
          automatically triggered on this specific date and time.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
        {/* Date Picker (60% width) */}
        <div className="sm:col-span-3">
          <DatePickerInput
            label="End Date"
            placeholder="Select date"
            minDate={now}
            maxDate={maxDate}
            value={dateVal}
            onChange={setDateVal}
            leftSection={<CalendarDays size={18} strokeWidth={1.5} />}
            clearable
            withAsterisk
            dropdownType="modal"
            classNames={pickerClasses}
          />
        </div>

        {/* Time Picker (40% width) */}
        <div className="sm:col-span-2">
          <TimeInput
            label="End Time"
            ref={timeInputRef}
            value={timeVal}
            onChange={(e) => setTimeVal(e.currentTarget.value)}
            placeholder="00:00"
            withAsterisk
            leftSection={<Clock size={18} strokeWidth={1.5} />}
            rightSection={
              <ActionIcon
                variant="subtle"
                color="gray"
                onClick={() => timeInputRef.current?.showPicker()}
              >
                <Clock size={14} strokeWidth={1.5} />
              </ActionIcon>
            }
            classNames={pickerClasses}
          />
        </div>
      </div>
    </div>
  );
}
