"use client";

import { getApiUrl } from "@omenai/url-config/src/config";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { v4 as uuidv4 } from "uuid"; // You'll need: npm install uuid @types/uuid
import { recordVisit } from "@omenai/shared-services/analytics/recordVisit";
export const useCampaignTracker = () => {
  const searchParams = useSearchParams();
  const [visitorId, setVisitorId] = useState<string>("");

  // Ref to prevent double-firing in React Strict Mode (Dev environment)
  const hasRecordedVisit = useRef(false);

  useEffect(() => {
    if (typeof document === "undefined") return;
    if (hasRecordedVisit.current) return; // Stop if we already recorded this session

    // 1. 🆔 Identity Check: Do they have a badge?
    // We store it in localStorage so it persists if they close/reopen the tab
    let storedVisitorId = localStorage.getItem("campaign_visitor_id");

    if (!storedVisitorId) {
      storedVisitorId = uuidv4();
      localStorage.setItem("campaign_visitor_id", storedVisitorId);
    }
    setVisitorId(storedVisitorId);

    // 2. 🧳 Prepare the Data
    const marketingData = {
      source: searchParams.get("utm_source") || "direct",
      medium: searchParams.get("utm_medium") || "none",
      campaign: searchParams.get("utm_campaign") || "none",
      referrer: document.referrer || "direct", // Who sent them here?
      visitorId: storedVisitorId,
    };

    // 3. 📡 The Signal: Send "Page View" to backend
    // We use sendBeacon if available (better for analytics), else fetch
    const payload = JSON.stringify(marketingData);
    const blob = new Blob([payload], { type: "application/json" });

    // Attempt to send data reliably
    const url = `${getApiUrl()}/api/analytics/record-visit`;
    if (navigator.sendBeacon) {
      navigator.sendBeacon(url, blob);
    } else {
      try {
        recordVisit(marketingData);
      } catch (error) {}
    }

    // Mark as done so we don't spam the API on re-renders
    hasRecordedVisit.current = true;
  }, [searchParams]);

  // --- Helper to attach data to the Sign-Up Form ---
  const getMarketingData = () => {
    return {
      source: searchParams.get("utm_source") || "direct",
      medium: searchParams.get("utm_medium") || "none",
      campaign: searchParams.get("utm_campaign") || "none",
      referrer: typeof document !== "undefined" ? document.referrer : "",
      visitorId: visitorId, // Link the signup to the visit!
    };
  };

  return { getMarketingData };
};
