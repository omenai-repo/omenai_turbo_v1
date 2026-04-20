"use client";

import React, { useState, useEffect } from "react";

interface PremiumDateInputProps {
  value: string; // Expected in YYYY-MM-DD format
  onChange: (value: string) => void;
  placeholder: string;
  error?: string;
  disablePastDates?: boolean; // NEW: Guardrail prop
}

export const PremiumDateInput = ({
  value,
  onChange,
  placeholder,
  error,
  disablePastDates = true,
}: PremiumDateInputProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const [viewDate, setViewDate] = useState<Date>(
    value ? new Date(value) : new Date(),
  );

  useEffect(() => {
    if (value) {
      const parsed = new Date(value);
      if (!isNaN(parsed.getTime())) {
        setViewDate(parsed);
      }
    }
  }, [value]);

  const toggleCalendar = () => setIsOpen(!isOpen);
  const closeCalendar = () => setIsOpen(false);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);
  const weekDays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  // Normalize today's date to midnight for accurate comparisons
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Guardrail: Determine if we should lock the "Prev Month" button
  const isCurrentMonthOrPast =
    disablePastDates &&
    (year < today.getFullYear() ||
      (year === today.getFullYear() && month <= today.getMonth()));

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isCurrentMonthOrPast) {
      setViewDate(new Date(year, month - 1, 1));
    }
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewDate(new Date(year, month + 1, 1));
  };

  const handleSelectDate = (day: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const selectedDate = new Date(year, month, day);

    // Guardrail: Block selection if it's in the past
    if (disablePastDates && selectedDate < today) return;

    const formatted = `${selectedDate.getFullYear()}-${String(
      selectedDate.getMonth() + 1,
    ).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`;

    onChange(formatted);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full">
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={(e) => {
            e.stopPropagation();
            closeCalendar();
          }}
        />
      )}

      {/* The Trigger Line */}
      <div
        onClick={toggleCalendar}
        className={`w-full border-b py-2 flex items-center justify-between transition-colors cursor-pointer relative z-40 ${
          error ? "border-red-500" : "border-neutral-300 hover:border-dark"
        } ${isOpen ? "border-dark" : ""}`}
      >
        <span
          className={`text-sm tracking-wide ${
            value ? "text-dark" : "text-neutral-300 uppercase text-[10px]"
          }`}
        >
          {value ? (
            new Date(value).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })
          ) : (
            <span className="text-neutral-400 uppercase text-[10px]">
              {placeholder}
            </span>
          )}
        </span>

        {/* NEW: Icon Container for Clear & Chevron */}
        <div className="flex items-center gap-1">
          {value && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation(); // Prevents the calendar from opening
                onChange(""); // Clears the value back to your form state
              }}
              className="p-1 text-neutral-300 hover:text-red-500 transition-colors rounded-sm"
              title="Clear date"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
          <svg
            className={`w-4 h-4 text-neutral-400 shrink-0 transition-transform duration-300 ${
              isOpen ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>

      {isOpen && (
        <div
          className="absolute left-0 top-full mt-3 w-[280px] bg-white border border-neutral-100 shadow-[0_8px_30px_rgb(0,0,0,0.08)] z-50 rounded-sm animate-in fade-in slide-in-from-top-2 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Controls */}
          <div className="flex items-center justify-between px-4 py-4 border-b border-neutral-50">
            <button
              type="button"
              onClick={handlePrevMonth}
              disabled={isCurrentMonthOrPast}
              className={`p-1.5 rounded-sm transition-colors ${
                isCurrentMonthOrPast
                  ? "text-neutral-200 cursor-not-allowed"
                  : "text-neutral-400 hover:text-dark hover:bg-neutral-50"
              }`}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <span className="text-sm font-medium tracking-wide text-dark">
              {viewDate.toLocaleString("default", { month: "long" })} {year}
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 text-neutral-400 hover:text-dark hover:bg-neutral-50 rounded-sm transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>

          {/* Days Grid */}
          <div className="p-4">
            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekDays.map((day) => (
                <div
                  key={day}
                  className="text-[10px] text-center text-neutral-400 uppercase tracking-widest font-medium"
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {blanks.map((blank) => (
                <div key={`blank-${blank}`} className="h-8" />
              ))}

              {days.map((day) => {
                const currentDate = new Date(year, month, day);
                const isPast = disablePastDates && currentDate < today;
                const isSelected =
                  value && new Date(value).getTime() === currentDate.getTime();
                const isToday = currentDate.getTime() === today.getTime();

                // Style hierarchy: Disabled -> Selected -> Today -> Default
                const buttonStyles = isPast
                  ? "text-neutral-300 cursor-not-allowed opacity-50"
                  : isSelected
                    ? "bg-dark text-white font-medium"
                    : isToday
                      ? "bg-neutral-100 text-dark font-medium hover:bg-neutral-200"
                      : "text-neutral-600 hover:bg-neutral-50 hover:text-dark";

                return (
                  <button
                    key={day}
                    type="button"
                    onClick={(e) => handleSelectDate(day, e)}
                    disabled={isPast}
                    className={`h-8 w-full text-xs flex items-center justify-center rounded-sm transition-colors ${buttonStyles}`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
      {error && (
        <p className="text-[10px] tracking-wide text-red-500 mt-2 animate-in fade-in slide-in-from-top-1 duration-200">
          {error}
        </p>
      )}
    </div>
  );
};
