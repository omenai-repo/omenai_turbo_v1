"use client";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { retrieveSubscriptionData } from "@omenai/shared-services/subscriptions/retrieveSubscriptionData";
import {
  SubscriptionModelSchemaTypes,
  SubscriptionPlanDataTypes,
} from "@omenai/shared-types";
import Load from "@omenai/shared-ui-components/components/loader/Load";
import { calculateSubscriptionPricing } from "@omenai/shared-utils/src/calculateSubscriptionPricing";
import { getCurrencySymbol } from "@omenai/shared-utils/src/getCurrencySymbol";
import { useQuery } from "@tanstack/react-query";
import { differenceInCalendarDays, sub } from "date-fns";
import React, { useMemo } from "react";
import MigrationUpgradeCheckoutItem from "./MigrationUpgradeCheckoutItem";

export default function MigrationUpgradeCheckout({
  plan,
  interval,
}: {
  plan: SubscriptionPlanDataTypes & {
    createdAt: string;
    updatedAt: string;
    _id: string;
  };
  interval: string;
}) {
  // Always call hooks in the same order, never conditionally
  const { user, csrf } = useAuth({ requiredRole: "gallery" });

  const {
    data: sub_data,
    isLoading: loading,
    isFetching,
  } = useQuery({
    queryKey: ["current_subscription", user?.gallery_id],
    queryFn: async () => {
      if (!user?.gallery_id) throw new Error("Missing gallery ID");
      const response = await retrieveSubscriptionData(
        user.gallery_id,
        csrf || ""
      );
      if (!response.isOk || response.data === undefined) {
        throw new Error(response.message || "Failed to retrieve subscription");
      }
      return response.data as SubscriptionModelSchemaTypes;
    },
    enabled: !!user?.gallery_id && !!csrf,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  // Only return after all hooks
  if (loading || isFetching || !user?.gallery_id || !csrf) return <Load />;
  if (!sub_data) return null;
  return (
    <MigrationUpgradeCheckoutItem
      plan={plan}
      interval={interval as "yearly" | "monthly"}
      sub_data={sub_data}
    />
  );
}
