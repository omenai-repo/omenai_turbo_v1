"use client";
import { getSalesActivityData } from "@omenai/shared-services/sales/getSalesActivityData";
import { salesDataAlgorithm } from "@omenai/shared-utils/src/salesDataAlgorithm";
import { useQuery } from "@tanstack/react-query";
import { SalesActivityChart } from "./components/SalesActivity";
import { artistActionStore } from "@omenai/shared-state-store/src/artist/actions/ActionStore";
import { ChartSkeleton } from "@omenai/shared-ui-components/components/skeletons/ChartSkeleton";
import React, { useMemo } from "react";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";

export default function ActivityWrapper() {
  const { user } = useAuth({ requiredRole: "artist" });
  const { sales_activity_year } = artistActionStore();
  const { data: sales, isLoading } = useQuery({
    queryKey: ["get_overview_sales_activity", sales_activity_year],
    queryFn: async () => {
      const data = await getSalesActivityData(
        user.artist_id as string,
        sales_activity_year
      );
      if (data?.isOk) {
        return data.data;
      }
    },
    enabled: !!sales_activity_year,
    staleTime: 0, // Data is considered stale immediately
    refetchOnWindowFocus: false,
  });

  const memoizedData = useMemo(
    () => salesDataAlgorithm(sales, "Sales Revenue ($)"),
    [sales, "Sales Revenue ($)"]
  );

  return (
    <div className="flex flex-col space-y-3 h-[350px] mt-4 relative">
      <div className="h-full w-full grid place-items-center">
        {isLoading ? (
          <ChartSkeleton />
        ) : (
          <SalesActivityChart
            data={[memoizedData]}
            year={sales_activity_year}
          />
        )}
      </div>
    </div>
  );
}
