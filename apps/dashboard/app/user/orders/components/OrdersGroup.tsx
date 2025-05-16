"use client";
import { Suspense, useState } from "react";
import PendingOrders from "./PendingOrders";
import OrdersTab from "./OrdersTab";
import { ObjectId } from "mongoose";
import CompletedOrders from "./CompletedOrders";
import { CreateOrderModelTypes } from "@omenai/shared-types";
import Load from "@omenai/shared-ui-components/components/loader/Load";

export default function OrdersGroup({
  orders,
}: {
  orders: CreateOrderModelTypes[] & {
    createdAt: string;
    updatedAt: string;
    _id: ObjectId;
  };
}) {
  const [tab, setTab] = useState("pending");

  const pending_orders: any = [];
  const processing_orders: any = [];
  const completed_orders: any = [];

  // Loop through orders once to classify them
  orders.forEach((order: any) => {
    if (order.order_accepted.status === "") {
      pending_orders.push(order);
    } else if (
      order.order_accepted.status === "accepted" &&
      !order.shipping_details.delivery_confirmed
    ) {
      pending_orders.push(order);
    } else if (
      (order.order_accepted.status === "accepted" &&
        order.status === "completed" &&
        order.shipping_details.delivery_confirmed) ||
      order.order_accepted.status === "declined"
    ) {
      completed_orders.push(order);
    }
  });

  return (
    <>
      <div className="w-full p-4 grid place-items-center container">
        <OrdersTab tab={tab} setTab={setTab} />
      </div>
      <div className="w-full h-full grid place-items-center max-w-screen-lg mx-auto">
        {tab === "pending" ? (
          <Suspense fallback={<Load />}>
            <PendingOrders orders={pending_orders} />
          </Suspense>
        ) : (
          <Suspense fallback={<Load />}>
            <CompletedOrders orders={completed_orders} />
          </Suspense>
        )}
      </div>
    </>
  );
}
