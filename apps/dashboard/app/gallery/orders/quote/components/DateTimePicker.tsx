import { OrderArtworkExhibitionStatus } from "@omenai/shared-types";
import { Dispatch, SetStateAction, useState, useEffect, useMemo } from "react";
import {
  CalendarDays,
  Clock,
  Info,
  ChevronLeft,
  ChevronRight,
  Check,
} from "lucide-react";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  addDays,
  isBefore,
  isAfter,
  startOfDay,
  setHours,
  setMinutes,
} from "date-fns";

// Helper to generate 30-minute intervals
const generateTimeSlots = () => {
  const slots = [];
  for (let i = 0; i < 24; i++) {
    for (let j = 0; j < 60; j += 30) {
      const hour12 = i % 12 === 0 ? 12 : i % 12;
      const ampm = i < 12 ? "AM" : "PM";
      const mins = j === 0 ? "00" : "30";
      slots.push({
        label: `${hour12}:${mins} ${ampm}`,
        hours24: i,
        minutes: j,
      });
    }
  }
  return slots;
};

export default function DateTimePickerComponent({
  handleDateTimeChange,
}: {
  handleDateTimeChange: Dispatch<
    SetStateAction<OrderArtworkExhibitionStatus | null>
  >;
}) {
  const today = useMemo(() => startOfDay(new Date()), []);
  const maxDate = useMemo(() => addMonths(today, 6), [today]);
  const allTimeSlots = useMemo(() => generateTimeSlots(), []);

  // States
  const [currentMonth, setCurrentMonth] = useState(today);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<{
    label: string;
    hours24: number;
    minutes: number;
  } | null>(null);
  const [timePeriod, setTimePeriod] = useState<"AM" | "PM">("AM");

  // --- CALENDAR LOGIC ---
  const nextMonth = () => {
    const next = addMonths(currentMonth, 1);
    if (!isAfter(next, maxDate)) setCurrentMonth(next);
  };

  const prevMonth = () => {
    const prev = subMonths(currentMonth, 1);
    if (!isBefore(prev, startOfMonth(today))) setCurrentMonth(prev);
  };

  const renderDays = () => {
    const startDate = startOfWeek(startOfMonth(currentMonth));
    const endDate = endOfWeek(endOfMonth(currentMonth));
    const dateFormat = "d";
    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const formattedDate = format(day, dateFormat);
        const cloneDay = day;

        const isPast = isBefore(day, today);
        const isTooFar = isAfter(day, maxDate);
        const isDisabled = isPast || isTooFar;
        const isSelected = selectedDate && isSameDay(day, selectedDate);
        const isCurrentMonth = isSameMonth(day, currentMonth);

        days.push(
          <button
            type="button"
            key={day.toString()}
            disabled={isDisabled}
            onClick={() => {
              setSelectedDate(cloneDay);
              setSelectedTime(null);

              // Smart Auto-Switch: If they click "Today" and it's past noon, default to PM
              if (isSameDay(cloneDay, today)) {
                const currentH = new Date().getHours();
                setTimePeriod(currentH >= 12 ? "PM" : "AM");
              } else {
                setTimePeriod("AM"); // Default to AM for future dates
              }
            }}
            className={`
              flex items-center justify-center h-9 w-9 rounded-sm  -full text-xs font-medium transition-all
              ${!isCurrentMonth ? "text-slate-300" : ""}
              ${isDisabled ? "text-slate-300 cursor-not-allowed" : "cursor-pointer"}
              ${isSelected ? "bg-dark text-white shadow-md" : ""}
              ${!isSelected && !isDisabled && isCurrentMonth ? "text-slate-700 hover:bg-slate-100" : ""}
              ${isSameDay(day, today) && !isSelected ? "border border-slate-300 text-slate-900 font-bold" : ""}
            `}
          >
            {formattedDate}
          </button>,
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="flex justify-between w-full mt-2" key={day.toString()}>
          {days}
        </div>,
      );
      days = [];
    }
    return <div className="w-full">{rows}</div>;
  };

  // --- TIME FILTERING LOGIC ---
  const availableTimes = useMemo(() => {
    if (!selectedDate) return [];

    // 1. Filter by AM / PM tab
    let filtered = allTimeSlots.filter((slot) => {
      const isAM = slot.hours24 < 12;
      return timePeriod === "AM" ? isAM : !isAM;
    });

    // 2. Filter out past times if it's "Today"
    if (isSameDay(selectedDate, today)) {
      const now = new Date();
      const currentH = now.getHours();
      const currentM = now.getMinutes();

      filtered = filtered.filter((slot) => {
        if (slot.hours24 > currentH) return true;
        if (slot.hours24 === currentH && slot.minutes > currentM) return true;
        return false;
      });
    }

    return filtered;
  }, [selectedDate, today, allTimeSlots, timePeriod]);

  // --- EMISSION LOGIC ---
  useEffect(() => {
    if (!selectedDate || !selectedTime) {
      handleDateTimeChange((prev) => {
        if (!prev) return prev;
        return { ...prev, exhibition_end_date: "" };
      });
      return;
    }

    const finalDate = setMinutes(
      setHours(selectedDate, selectedTime.hours24),
      selectedTime.minutes,
    );
    const isoString = finalDate.toISOString().replace("Z", "+00:00");

    handleDateTimeChange({
      is_on_exhibition: true,
      exhibition_end_date: isoString,
      status: "pending",
    });
  }, [selectedDate, selectedTime, handleDateTimeChange]);

  return (
    <div className="w-full flex flex-col gap-5 animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="bg-amber-50/50 border border-amber-100 rounded-sm  -lg p-3.5 flex items-start gap-3">
        <Info className="text-amber-600 shrink-0 mt-0.5" size={16} />
        <p className="text-xs text-amber-800 leading-relaxed">
          <span className="font-semibold block mb-0.5 text-amber-900">
            Automated Logistics
          </span>
          A shipment request will be automatically triggered on the exact date
          and time you select below.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 bg-white p-5 rounded-sm  border border-slate-200 shadow-sm">
        {/* LEFT: Custom Calendar */}
        <div className="w-full md:w-[280px] shrink-0">
          <div className="flex items-center justify-between mb-5">
            <button
              type="button"
              onClick={prevMonth}
              disabled={isSameMonth(currentMonth, today)}
              className="p-1.5 rounded-sm  -lg hover:bg-slate-100 text-slate-600 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-bold text-slate-800 tracking-tight">
              {format(currentMonth, "MMMM yyyy")}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              disabled={isSameMonth(currentMonth, maxDate)}
              className="p-1.5 rounded-sm  -lg hover:bg-slate-100 text-slate-600 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex justify-between w-full mb-3">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
              <div
                key={day}
                className="w-9 text-center text-[10px] font-bold uppercase text-slate-400"
              >
                {day}
              </div>
            ))}
          </div>

          {renderDays()}
        </div>

        <div className="hidden md:block w-px bg-slate-100"></div>

        {/* RIGHT: AM/PM Grid Time Picker */}
        <div className="flex-1 flex flex-col min-h-[280px]">
          {/* Dynamic Header with AM/PM Toggle */}
          <div className="flex items-center justify-between mb-4">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-slate-400" />
              {selectedDate ? format(selectedDate, "MMM do") : "Select a Time"}
            </label>

            {/* AM / PM Segmented Control */}
            {selectedDate && (
              <div className="flex items-center bg-slate-100 p-0.5 rounded-sm  -lg border border-slate-200/60">
                <button
                  type="button"
                  onClick={() => setTimePeriod("AM")}
                  className={`px-3 py-1 text-[11px] font-bold rounded-sm  transition-all ${
                    timePeriod === "AM"
                      ? "bg-white text-dark shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  AM
                </button>
                <button
                  type="button"
                  onClick={() => setTimePeriod("PM")}
                  className={`px-3 py-1 text-[11px] font-bold rounded-sm  transition-all ${
                    timePeriod === "PM"
                      ? "bg-white text-dark shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  PM
                </button>
              </div>
            )}
          </div>

          {/* Time Grid Content */}
          {/* Time Grid Content */}
          {!selectedDate ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center border-2 border-dashed border-slate-100 rounded-sm  p-6">
              <CalendarDays className="w-8 h-8 text-slate-200 mb-2" />
              <p className="text-sm font-medium text-slate-500">
                Select a date first
              </p>
            </div>
          ) : availableTimes.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center border-2 border-dashed border-slate-100 rounded-sm  p-6">
              <Clock className="w-8 h-8 text-slate-200 mb-2" />
              <p className="text-sm font-medium text-slate-500">
                No {timePeriod} times available
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Try the {timePeriod === "AM" ? "PM" : "AM"} tab or a future
                date.
              </p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
              {/* Shifted to a responsive 2 or 3 column grid to fit the AM/PM text beautifully */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pb-2">
                {availableTimes.map((slot) => {
                  const isSelected = selectedTime?.label === slot.label;

                  return (
                    <button
                      key={slot.label}
                      type="button"
                      onClick={() => setSelectedTime(slot)}
                      className={`
                        flex items-center justify-center py-2.5 rounded-sm  -lg border text-xs font-bold transition-all outline-none
                        ${
                          isSelected
                            ? "border-dark bg-dark text-white shadow-md ring-2 ring-dark/20 ring-offset-1"
                            : "border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50 bg-white"
                        }
                      `}
                    >
                      {/* Full label restored: e.g., "10:30 AM" */}
                      {slot.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Selection Confirmation Bar */}
      <div className="h-10">
        {selectedDate && selectedTime && (
          <div className="flex items-center gap-2 animate-in fade-in bg-emerald-50 text-emerald-700 px-4 py-2.5 rounded-sm  -lg border border-emerald-100 w-fit">
            <Check className="w-4 h-4 shrink-0" />
            <span className="text-xs font-medium">
              Scheduled for{" "}
              <strong>{format(selectedDate, "MMM do, yyyy")}</strong> at{" "}
              <strong>{selectedTime.label}</strong>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
