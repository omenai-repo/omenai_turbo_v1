"use client";
import { useQuery } from "@tanstack/react-query";
import { getOrdersForUser } from "@omenai/shared-services/orders/getOrdersForUser";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { useWindowSize } from "usehooks-ts";
import { OrdersTab } from "./components/OrdersTab";
import { UsersOrdersTabSkeleton } from "@omenai/shared-ui-components/components/skeletons/AccountManagementSkeleton";

export default function Orders() {
  const { width } = useWindowSize();
  const { user } = useAuth({ requiredRole: "user" });
  const { data: orders, isLoading } = useQuery({
    queryKey: ["user_orders_page"],
    queryFn: async () => {
      const orders = await getOrdersForUser(user.id);

      if (!orders?.isOk) throw new Error("Something went wrong");
      else return orders.data;
    },
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return (
      <div className="h-[50vh] w-full grid place-items-center">
        <UsersOrdersTabSkeleton />
      </div>
    );
  }
  return <OrdersTab orders={orders} />;
}
