"use client";
import React, { useState, useEffect } from "react";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export const CountdownTimer = () => {
  const [targetDate] = useState(new Date("2026-02-13T00:00:00"));

  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate.getTime() - now;

      if (distance < 0) {
        clearInterval(timer);
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor(
          (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
        ),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    }, 1000);

    return () => clearInterval(timer);
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
        <span className="font-sans text-3xl md:text-4xl lg:text-5xl font-light tracking-tighter text-black">
          {String(value).padStart(2, "0")}
        </span>
        <span className="font-sans text-[9px] uppercase tracking-[0.2em] text-emerald-700 mt-2 font-bold">
          {label}
        </span>
      </div>
      {showDivider && <div className="h-10 w-px bg-neutral-200" />}
    </div>
  );

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
