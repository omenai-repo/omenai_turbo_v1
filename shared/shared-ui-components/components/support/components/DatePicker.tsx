import React, { useState, useRef, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface PremiumDatePickerProps {
  value: string | Date | null;
  onChange: (date: string) => void;
  label?: string;
}

type CalendarView = "days" | "years";

const PremiumDatePicker = ({
  value,
  onChange,
  label = "Transaction Date",
}: PremiumDatePickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<CalendarView>("days"); // New state for switching views
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    value ? new Date(value) : null,
  );

  // For Year View navigation (showing a 12-year window)
  const [yearWindowStart, setYearWindowStart] = useState(
    new Date().getFullYear() - 5,
  );

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setView("days"); // Reset view on close
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- LOGIC: DATE CALCULATIONS ---
  const daysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const firstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  // --- HANDLERS ---
  const handleDateSelect = (day: number) => {
    const newDate = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day,
    );
    setSelectedDate(newDate);
    onChange(newDate.toISOString().split("T")[0]);
    setTimeout(() => setIsOpen(false), 150);
  };

  const handleYearSelect = (year: number) => {
    const newDate = new Date(currentMonth);
    newDate.setFullYear(year);
    setCurrentMonth(newDate);
    setView("days"); // Switch back to day view
  };

  const previousMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1),
    );
  };

  const nextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1),
    );
  };

  const prevYearWindow = (e: React.MouseEvent) => {
    e.stopPropagation();
    setYearWindowStart((prev) => prev - 12);
  };

  const nextYearWindow = (e: React.MouseEvent) => {
    e.stopPropagation();
    setYearWindowStart((prev) => prev + 12);
  };

  // --- RENDERERS ---
  const renderCalendarDays = () => {
    const days = [];
    const totalDays = daysInMonth(currentMonth);
    const firstDay = firstDayOfMonth(currentMonth);
    const today = new Date();

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-7 w-7" />);
    }

    for (let day = 1; day <= totalDays; day++) {
      const date = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        day,
      );
      const isSelected =
        selectedDate && date.toDateString() === selectedDate.toDateString();
      const isToday = date.toDateString() === today.toDateString();

      days.push(
        <button
          key={day}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleDateSelect(day);
          }}
          className={`
            h-7 w-7 flex items-center justify-center text-[11px] rounded-full transition-all duration-200
            ${
              isSelected
                ? "bg-slate-800 text-white font-medium shadow-sm"
                : "text-slate-700 hover:bg-slate-100"
            }
            ${!isSelected && isToday ? "bg-slate-50 text-emerald-600 font-semibold border border-slate-200" : ""}
          `}
        >
          {day}
        </button>,
      );
    }
    return days;
  };

  const renderYears = () => {
    const years = [];
    for (let i = 0; i < 12; i++) {
      const year = yearWindowStart + i;
      const isSelectedYear = currentMonth.getFullYear() === year;

      years.push(
        <button
          key={year}
          type="button"
          onClick={() => handleYearSelect(year)}
          className={`
            py-2 text-xs rounded-md transition-all
            ${
              isSelectedYear
                ? "bg-slate-800 text-white font-medium shadow-sm"
                : "text-slate-700 hover:bg-slate-50 border border-transparent hover:border-slate-200"
            }
          `}
        >
          {year}
        </button>,
      );
    }
    return years;
  };

  return (
    <div className="w-full relative" ref={containerRef}>
      <label className="text-[10px] font-medium text-slate-500 uppercase tracking-[0.12em] mb-1.5 block">
        {label}
      </label>

      {/* Trigger Input */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full bg-white border text-slate-900 text-sm rounded-md 
          block px-3 py-2 outline-none transition-all cursor-pointer flex items-center justify-between
          ${isOpen ? "border-slate-400 ring-1 ring-slate-100" : "border-slate-300 hover:border-slate-400"}
        `}
      >
        <span
          className={`text-sm ${!selectedDate ? "text-slate-400 font-light" : "font-light"}`}
        >
          {selectedDate
            ? selectedDate.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            : "Select date"}
        </span>
        <CalendarIcon size={14} className="text-slate-400" />
      </div>

      {/* Dropdown Calendar */}
      {isOpen && (
        <div className="absolute z-50 top-[calc(100%+4px)] left-0 w-full min-w-[240px] bg-white border border-slate-200 rounded-lg shadow-xl p-3 animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-100">
            <button
              type="button"
              onClick={view === "days" ? previousMonth : prevYearWindow}
              className="p-1 hover:bg-slate-100 rounded-md text-slate-500 transition-colors"
            >
              <ChevronLeft size={14} />
            </button>

            <div className="flex gap-1">
              {/* Month (Only clickable in day view, strictly speaking we just show it) */}
              {view === "days" && (
                <span className="text-xs font-semibold text-slate-900 px-1 py-0.5 rounded cursor-default">
                  {monthNames[currentMonth.getMonth()]}
                </span>
              )}

              {/* Year (Clickable to toggle view) */}
              <button
                type="button"
                onClick={() => setView(view === "days" ? "years" : "days")}
                className={`text-xs font-semibold px-1.5 py-0.5 rounded transition-colors ${
                  view === "years"
                    ? "bg-slate-100 text-slate-900"
                    : "text-slate-900 hover:bg-slate-200 bg-slate-100 px-4"
                }`}
              >
                {view === "days" ? currentMonth.getFullYear() : "Select Year"}
              </button>
            </div>

            <button
              type="button"
              onClick={view === "days" ? nextMonth : nextYearWindow}
              className="p-1 hover:bg-slate-100 rounded-md text-slate-500 transition-colors"
            >
              <ChevronRight size={14} />
            </button>
          </div>

          {/* View Content */}
          {view === "days" ? (
            <>
              {/* Weekday Labels */}
              <div className="grid grid-cols-7 gap-0 mb-1 place-items-center">
                {dayNames.map((day) => (
                  <div
                    key={day}
                    className="text-[9px] text-center text-slate-400 font-bold uppercase tracking-wider w-7"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Days Grid */}
              <div className="grid grid-cols-7 gap-y-1 gap-x-0 place-items-center">
                {renderCalendarDays()}
              </div>
            </>
          ) : (
            /* Years Grid */
            <div className="grid grid-cols-3 gap-2">{renderYears()}</div>
          )}
        </div>
      )}
    </div>
  );
};

export default PremiumDatePicker;
