"use client";
import { Tabs } from "@mantine/core";
import { PackageCheck, PackageMinus, PackageSearch, Pause } from "lucide-react";
import CompletedOrders from "./CompletedOrders";
import PendingOrders from "./PendingOrders";
import ProcessingOrders from "./ProcessingOrders";
import { CreateOrderModelTypes } from "@omenai/shared-types";

export function OrdersTab({ orders }: { orders: CreateOrderModelTypes[] }) {
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
      processing_orders.push(order);
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
    <Tabs
      color="#1a1a1a"
      variant="pills"
      radius="xl"
      orientation="vertical"
      defaultValue="pending"
    >
      <Tabs.List className="space-y-5 text-fluid-xs">
        <Tabs.Tab
          value="pending"
          leftSection={<PackageMinus strokeWidth={1.5} absoluteStrokeWidth />}
        >
          Pending orders
        </Tabs.Tab>
        <Tabs.Tab
          value="processing"
          leftSection={<PackageSearch strokeWidth={1.5} absoluteStrokeWidth />}
        >
          Orders in progress
        </Tabs.Tab>
        <Tabs.Tab
          value="completed"
          leftSection={<PackageCheck strokeWidth={1.5} absoluteStrokeWidth />}
        >
          Completed orders
        </Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="pending" className="container px-5">
        <PendingOrders orders={pending_orders} />
      </Tabs.Panel>

      <Tabs.Panel value="processing" className="container px-5">
        <ProcessingOrders orders={processing_orders} />
      </Tabs.Panel>

      <Tabs.Panel value="completed" className="container px-5">
        <CompletedOrders orders={completed_orders} />
      </Tabs.Panel>
    </Tabs>
  );
}
