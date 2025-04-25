"use client";
import { Suspense, useState } from "react";
import PendingOrders from "./PendingOrders";
import OrdersTab from "./OrdersTab";
import { useQuery } from "@tanstack/react-query";
import ProcessingOrders from "./ProcessingOrders";
import CompletedOrders from "./CompletedOrders";
import { getOverviewOrders } from "@omenai/shared-services/orders/getOverviewOrders";
import Load from "@omenai/shared-ui-components/components/loader/Load";
import { GallerySchemaTypes } from "@omenai/shared-types";
import { useSession } from "@omenai/package-provider/SessionProvider";

export default function OrdersGroup() {
  const session = useSession() as GallerySchemaTypes;
  const [tab, setTab] = useState("pending");
  const { data: orders, isLoading } = useQuery({
    queryKey: ["fetch_orders_by_category"],
    queryFn: async () => {
      const result = await getOverviewOrders(session.gallery_id);

      // Handle potential undefined result
      if (!result) {
        return []; // Return an empty array if the result is undefined
      }

      const { isOk, data } = result;

      // Return the data if isOk, else return an empty array
      return isOk ? data : [];
    },
  });

  if (isLoading)
    return (
      <div className="h-[75vh] grid place-items-center">
        <Load />
      </div>
    );

  // Extract the shared type definition
  // type OrderType = CreateOrderModelTypes & {
  //   createdAt: string;
  //   updatedAt: string;
  //   _id: ObjectId;
  // };

  const pending_orders: any = [];
  const processing_orders: any = [];
  const completed_orders: any = [];

  // Loop through orders once to classify them
  orders.forEach((order: any) => {
    if (order.order_accepted.status === "") {
      pending_orders.push(order);
    } else if (
      order.order_accepted.status === "accepted" &&
      !order.delivery_confirmed
    ) {
      processing_orders.push(order);
    } else if (order.status === "completed") {
      completed_orders.push(order);
    }
  });
  return (
    <>
      <div className="w-full my-3">
        <OrdersTab tab={tab} setTab={setTab} />
      </div>
      <div className="w-full h-full grid place-items-center ">
        {tab === "pending" && (
          <Suspense fallback={<Load />}>
            <PendingOrders orders={pending_orders} />
          </Suspense>
        )}
        {tab === "processing" && (
          <Suspense fallback={<Load />}>
            <ProcessingOrders orders={processing_orders} />
          </Suspense>
        )}
        {tab === "completed" && (
          <Suspense fallback={<Load />}>
            <CompletedOrders orders={completed_orders} />
          </Suspense>
        )}
      </div>
    </>
  );
}
