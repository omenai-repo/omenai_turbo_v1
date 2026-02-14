"use client";
import React, { useState, useEffect } from "react";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export const CountdownTimer = () => {
  // NOTE: Ensure this date string matches your exact deadline
  const [targetDate] = useState(new Date("2026-02-13T00:00:00"));
  const [isExpired, setIsExpired] = useState(false);

  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date().getTime();
      const distance = targetDate.getTime() - now;

      // If time is up, trigger the expired state
      if (distance < 0) {
        setIsExpired(true);
        return false; // Return false to stop the interval
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor(
          (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
        ),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
      return true;
    };

    // Run immediately on mount to check status (prevents flash of 00:00:00)
    const isActive = calculateTime();

    if (isActive) {
      const timer = setInterval(() => {
        if (!calculateTime()) {
          clearInterval(timer);
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [targetDate]);

  const TimeUnit = ({
    value,
    label,
    showDivider = true,
  }: {
    value: number;
    label: string;
    showDivider?: boolean;
  }) => (
    <div className="flex items-center">
      <div className="flex flex-col items-center px-4 md:px-6">
        <span className="font-sans text-3xl md:text-4xl lg:text-5xl font-light tracking-tighter text-dark">
          {String(value).padStart(2, "0")}
        </span>
        <span className="font-sans text-[9px] uppercase tracking-[0.2em] text-emerald-700 mt-2 font-bold">
          {label}
        </span>
      </div>
      {showDivider && <div className="h-10 w-px bg-neutral-200" />}
    </div>
  );

  // ---------------------------------------------------------
  // 1. RENDER: The "Post-Deadline" / Final Boarding State
  // ---------------------------------------------------------
  if (isExpired) {
    return (
      <div className="w-full py-10 mb-12 border-y border-neutral-100 flex flex-col md:flex-row justify-between items-center gap-6 animate-in fade-in duration-1000 px-4 md:px-8 bg-neutral-50/50">
        <div className="flex items-center gap-4">
          {/* Status Indicator: Changed from Pulse Green to Solid/Warning or Completed */}
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-600"></span>
          </div>

          <div className="flex flex-col">
            <span className="font-sans text-xl md:text-2xl font-normal tracking-tighter text-dark">
              Official Waitlist Closed
            </span>
            <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 mt-1">
              Launch Sequence Initiated
            </span>
          </div>
        </div>

        {/* CTA Hint */}
        <div className="hidden md:block">
          <span className="font-mono text-xs font-medium text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
            Final Boarding Active
          </span>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------
  // 2. RENDER: The Standard Countdown
  // ---------------------------------------------------------
  return (
    <div className="w-full py-8 mb-12 border-y border-neutral-100 flex justify-start items-center animate-in fade-in duration-1000">
      <TimeUnit value={timeLeft.days} label="Days" />
      <TimeUnit value={timeLeft.hours} label="Hours" />
      <TimeUnit value={timeLeft.minutes} label="Mins" />
      <TimeUnit value={timeLeft.seconds} label="Secs" showDivider={false} />

      <div className="ml-auto hidden md:flex items-center gap-3">
        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="font-serif text-[10px] uppercase tracking-widest text-neutral-400">
          Until Launch
        </span>
      </div>
    </div>
  );
};
