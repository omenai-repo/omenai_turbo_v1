"use client";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { useEffect } from "react";
import { useLocalStorage, useReadLocalStorage } from "usehooks-ts";
export default function Tour() {
  const steps = [
    {
      element: "#tour-highlights",
      popover: {
        title: "Welcome aboard!",
        description:
          "Welcome to your dashboard. You can find quick highlights about the perfomance of your account on the platform here",
      },
    },
    {
      element: "#tour-search",
      popover: {
        description:
          "Once your artworks starts gaining popularity, we'll be sure to show you your top-rated artworks amongst our users.",
      },
    },
    {
      element: "#tour-orders",
      popover: {
        description:
          "You can view your sales progress from this chart here, it keeps track of and shows how much revenue you've made from successful artwork sales.",
      },
    },
    {
      element: "#tour-footer",
      popover: {
        description:
          "This is where you can view the most recent list of orders made for various artworks you've uploaded.",
      },
    },
    {
      element: "#navigation-items",
      popover: {
        description:
          "You can switch between your dashboard links or navigate to another dashboard page from here",
      },
    },
    {
      element: "#gallery-verification",
      popover: {
        description:
          "Your account is currently under verification, and an agent will contact you shortly. To expedite this process, please inform the administrator by clicking the request button.",
      },
    },
  ];

  const [tour, setTour] = useLocalStorage("tour", "");
  const isFinished = useReadLocalStorage("tour") ?? "";

  useEffect(() => {
    // Ensure this runs on client-side only
    if (isFinished === "true") return;

    // Initialize driver only if running on the client-side
    if (typeof window !== "undefined") {
      const driverObj = driver({
        showProgress: true,
        steps,
        allowClose: false,
      });

      driverObj.drive();
      setTour("true");
    }
  }, []);

  return null;
}
