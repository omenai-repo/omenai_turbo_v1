"use client";
import { useState, useEffect, useMemo } from "react";
import { useWindowSize } from "usehooks-ts";

export function useDeviceBlock() {
  const { width } = useWindowSize();
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    if (typeof window !== "undefined") {
      const ua = navigator.userAgent;
      const isMobileUA = /Android|iPhone|iPad|iPod/i.test(ua);
      const isInAppBrowser = /Instagram|FBAN|FBAV|Line|Twitter/i.test(ua);

      setIsMobileDevice(isMobileUA || isInAppBrowser);
    }
  }, []);

  const shouldBlock = useMemo(() => {
    if (!width) return false;
    const isSmallScreen = width < 768;
    return isSmallScreen || isMobileDevice;
  }, [width, isMobileDevice]);

  return { shouldBlock, isMounted };
}
