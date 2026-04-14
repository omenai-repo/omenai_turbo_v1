"use client";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { ArtistCategory } from "@omenai/shared-types";
import React from "react";
import ArtworkPricing from "./ArtworkPricing";
import PriceSetup from "./ArtworkPricingAlternate";

const self_price_eligibility: Omit<
  ArtistCategory,
  "Emerging" | "Early Mid-Career"
>[] = ["Mid-Career", "Late Mid-Career", "Established", "Elite"];

export default function ArtworkPricingWrapper() {
  const { user } = useAuth({ requiredRole: "artist" });
  const categorization = user.categorization;

  const isEligibleForSelfPricing =
    self_price_eligibility.includes(categorization);

  return isEligibleForSelfPricing ? <PriceSetup /> : <ArtworkPricing />;
}
