"use client";
import { useState } from "react";

import { useQuery } from "@tanstack/react-query";

import { getOverviewOrders } from "@omenai/shared-services/orders/getOverviewOrders";
import { OrdersTab } from "./OrdersTab";
import { OrderSkeleton } from "@omenai/shared-ui-components/components/skeletons/OrdersSkeleton";
import React from "react";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { UsersOrdersTabSkeleton } from "@omenai/shared-ui-components/components/skeletons/AccountManagementSkeleton";
export default function OrdersGroup() {
  const { user } = useAuth({ requiredRole: "artist" });
  const [tab, setTab] = useState("pending");
  const { data: orders, isLoading } = useQuery({
    queryKey: ["fetch_orders_by_category"],
    queryFn: async () => {
      const result = await getOverviewOrders(user.artist_id);

      // Handle potential undefined result
      if (!result) {
        return []; // Return an empty array if the result is undefined
      }

      const { isOk, data } = result;

      // Return the data if isOk, else return an empty array
      return isOk ? data : [];
    },
  });

  return (
    <>
      <div className="w-full mt-4">
        {isLoading ? <UsersOrdersTabSkeleton /> : <OrdersTab orders={orders} />}
      </div>
    </>
  );
}
