"use client";
import { getOrderByFilter } from "@omenai/shared-services/orders/getOrdersByFilter";

import { useQuery } from "@tanstack/react-query";

import { ArtistSchemaTypes } from "@omenai/shared-types";
import { useSession } from "@omenai/package-provider/SessionProvider";
import NotFoundData from "@omenai/shared-ui-components/components/notFound/NotFoundData";
import { OrderRequestSkeleton } from "@omenai/shared-ui-components/components/skeletons/OrderRequestSkeleton";
import { OrdersAccordion } from "../../../../../components/OrdersAccordion";

export default function Orders() {
  const session = useSession() as ArtistSchemaTypes;
  const { data: orders, isLoading } = useQuery({
    queryKey: ["get_overview_order"],
    queryFn: async () => {
      const orders = await getOrderByFilter(session.artist_id);
      if (orders?.isOk) {
        return orders.data;
      }
      throw new Error(orders?.message);
    },
    refetchOnWindowFocus: false,
  });

  return (
    <div className="p-4 min-h-[300px] flex flex-col gap-y-4">
      <div className="w-full h-full ring-1 ring-[#eeeeee] p-6 rounded-[20px]">
        <h1 className="font-medium self-start">Order Requests</h1>
        <div className="grid place-items-center w-full h-full">
          {isLoading ? (
            <OrderRequestSkeleton />
          ) : (
            <>
              {orders.length === 0 ? (
                <NotFoundData />
              ) : (
                <OrdersAccordion orders={orders} route="/artist/app/orders" />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
