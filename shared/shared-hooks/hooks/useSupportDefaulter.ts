"use client";

import { SupportCategory } from "@omenai/shared-types";
import { usePathname, useSearchParams } from "next/navigation";
import { useMemo } from "react";

// EXPANDED Categories to respect Entity separation

interface SupportDefault {
  category: SupportCategory;
  referenceId: string;
}

const PAYMENT_PARAM_KEYS = [
  "ref",
  "tx_ref",
  "payment_intent",
  "reference",
  "trxref",
  "transaction_id",
  "session_id",
];

export function useSupportDefaulter(): SupportDefault {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const defaults = useMemo((): SupportDefault => {
    if (!pathname) return { category: "GENERAL", referenceId: "" };

    if (
      pathname.includes("/artworks/upload") ||
      pathname.includes("/artworks")
    ) {
      return { category: "UPLOAD", referenceId: "" };
    }
    // --- 1. BUYER PAYMENTS (Incoming Money) ---
    if (pathname.includes("/payment")) {
      let foundRef = "";
      if (searchParams) {
        const matchingKey = PAYMENT_PARAM_KEYS.find((key) =>
          searchParams.has(key),
        );
        if (matchingKey) foundRef = searchParams.get(matchingKey) || "";
      }
      return { category: "PAYMENT", referenceId: foundRef };
    }

    if (pathname.includes("/purchase")) {
      const segments = pathname.split("/");
      // Find the segment immediately after "purchase"
      const purchaseIndex = segments.indexOf("purchase");
      const artId = segments[purchaseIndex + 1];

      return {
        category: "CHECKOUT",
        referenceId: artId || "", // Returns the Art ID (e.g. "65a...")
      };
    }

    // --- 2. ORDERS ---
    if (pathname.includes("/orders")) {
      const segments = pathname.split("/");
      const lastSegment = segments[segments.length - 1];
      const isGenericPage = ["list", "overview", "orders", "quote"].includes(
        lastSegment,
      );
      return {
        category: "ORDER",
        referenceId: isGenericPage ? "" : lastSegment,
      };
    }

    // --- 3. GALLERY BILLING (Outgoing Subscription) ---
    // Strictly checks for 'billing' path.
    if (pathname.includes("/billing")) {
      return { category: "SUBSCRIPTION", referenceId: "" };
    }

    // --- 4. GALLERY PAYOUTS (Stripe Connect) ---
    // Strictly checks for 'payout' path.
    if (pathname.includes("/payout")) {
      return { category: "PAYOUT", referenceId: "" };
    }

    // --- 5. ARTIST WALLET (Withdrawals) ---
    // Strictly checks for 'wallet' path.
    if (pathname.includes("/wallet")) {
      return { category: "WALLET", referenceId: "" };
    }

    // --- 6. AUTH ---
    if (pathname.includes("/login") || pathname.includes("/register")) {
      return { category: "AUTH", referenceId: "" };
    }

    return { category: "GENERAL", referenceId: "" };
  }, [pathname, searchParams]);

  return defaults;
}
