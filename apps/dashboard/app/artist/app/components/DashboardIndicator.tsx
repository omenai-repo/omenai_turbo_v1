"use client";

import { useEffect, useState } from "react";

type AppbarTypes = {
  artist_name: string;
};

export default function DashboardIndicator({ artist_name }: AppbarTypes) {
  const [currentTime, setCurrentTime] = useState<string>("");
  const [greeting, setGreeting] = useState<string>("");

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();

      // Format time
      const formatted = now.toLocaleString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      setCurrentTime(formatted);

      // Determine greeting
      const hour = now.getHours();

      if (hour >= 5 && hour < 12) {
        setGreeting("Good morning");
      } else if (hour >= 12 && hour < 17) {
        setGreeting("Good afternoon");
      } else if (hour >= 17 && hour < 21) {
        setGreeting("Good evening");
      } else {
        setGreeting("Have a lovely night rest");
      }
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full flex justify-between items-center">
      <div className="space-y-1">
        <p className="text-fluid-xxs text-dark font-normal">
          {greeting}, <strong>{artist_name}</strong>
        </p>

        <p className="text-fluid-xxs font-medium text-dark/70">{currentTime}</p>
      </div>
    </div>
  );
}
