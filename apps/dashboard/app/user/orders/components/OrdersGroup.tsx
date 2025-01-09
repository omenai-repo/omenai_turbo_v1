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

  const pending_orders = orders.filter(
    (order: CreateOrderModelTypes) =>
      !order.shipping_details.delivery_confirmed && order.availability
  ) as CreateOrderModelTypes[] & {
    createdAt: string;
    updatedAt: string;
    _id: ObjectId;
  };

  const completed_orders = orders.filter(
    (order: CreateOrderModelTypes) =>
      order.shipping_details.delivery_confirmed || !order.availability
  );

  return (
    <>
      <div className="w-full p-5 grid place-items-center container">
        <OrdersTab tab={tab} setTab={setTab} />
      </div>
      <div className="w-full h-full grid place-items-center container">
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
