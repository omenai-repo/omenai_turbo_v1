import { useState, useEffect, useCallback } from "react";

export const useRedirectBehavior = (scrollThreshold = 20) => {
  const [isScrolled, setIsScrolled] = useState(false);

  // 1. Scroll Logic
  const handleScroll = useCallback(() => {
    // Only update state if the value actually changes to avoid re-renders
    const scrolled = window.scrollY > scrollThreshold;
    setIsScrolled((prev) => (prev !== scrolled ? scrolled : prev));
  }, [scrollThreshold]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.addEventListener("scroll", handleScroll);
      handleScroll(); // Check immediately on mount
    }
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // 2. URL Logic: A helper function, not a state variable
  const getCurrentUrl = useCallback(() => {
    if (typeof window === "undefined") return "";
    // This grabs the exact URL at the moment this function is called
    return window.location.href;
  }, []);

  return { isScrolled, getCurrentUrl };
};
