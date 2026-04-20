"use client";

import { Tabs } from "@mantine/core";
import { PackageCheck, PackageMinus, PackageSearch } from "lucide-react";
import { CreateOrderModelTypes } from "@omenai/shared-types";
import { OrderCardList } from "./OrdersList";

export function OrdersTab({ orders }: { orders: CreateOrderModelTypes[] }) {
  const pending_orders: CreateOrderModelTypes[] = [];
  const processing_orders: CreateOrderModelTypes[] = [];
  const completed_orders: CreateOrderModelTypes[] = [];

  orders.forEach((order) => {
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

  const allOrdersCount =
    pending_orders.length + processing_orders.length + completed_orders.length;

  return (
    <div className="w-full max-w-full mx-auto space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-normal text-slate-900">
            Order Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Overview of your sales pipeline
          </p>
        </div>
        <div className="flex items-center gap-x-3 px-4 py-2 w-fit bg-white border border-slate-200 rounded shadow-sm">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            Total Orders
          </span>
          <span className="h-4 w-[1px] bg-slate-200"></span>
          <span className="text-sm font-bold text-slate-900">
            {allOrdersCount}
          </span>
        </div>
      </div>

      {/* Tabs Section */}
      <Tabs
        defaultValue="pending"
        variant="pills"
        radius="sm"
        classNames={{
          root: "w-full",
          list: "flex flex-wrap gap-2 mb-8",
          tab: "data-[active]:bg-dark data-[active]:text-white bg-white border border-slate-200 text-slate-600 font-normal px-5 h-10 hover:bg-slate-50 transition-all",
        }}
      >
        <Tabs.List className="w-full">
          <Tabs.Tab value="pending">
            <TabLabel
              icon={<PackageMinus size={16} />}
              label="Pending"
              count={pending_orders.length}
              color="amber"
            />
          </Tabs.Tab>
          <Tabs.Tab value="processing">
            <TabLabel
              icon={<PackageSearch size={16} />}
              label="In Progress"
              count={processing_orders.length}
              color="blue"
            />
          </Tabs.Tab>
          <Tabs.Tab value="completed">
            <TabLabel
              icon={<PackageCheck size={16} />}
              label="Completed"
              count={completed_orders.length}
              color="emerald"
            />
          </Tabs.Tab>
        </Tabs.List>

        {/* Content Area */}
        <div className="min-h-[400px]">
          <Tabs.Panel value="pending">
            <OrderCardList
              orders={pending_orders}
              emptyLabel="No pending orders"
            />
          </Tabs.Panel>
          <Tabs.Panel value="processing">
            <OrderCardList
              orders={processing_orders}
              emptyLabel="No orders in progress"
            />
          </Tabs.Panel>
          <Tabs.Panel value="completed">
            <OrderCardList
              orders={completed_orders}
              emptyLabel="No completed orders history"
            />
          </Tabs.Panel>
        </div>
      </Tabs>
    </div>
  );
}

// Helper for Tab Label styling
function TabLabel({
  icon,
  label,
  count,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  count: number;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2 w-full">
      {icon}
      <span>{label}</span>
      {count > 0 && (
        <span
          className={`ml-1 flex h-5 min-w-[20px] items-center justify-center rounded px-1.5 text-[10px] font-bold ring-1 ring-inset ${
            color === "amber"
              ? "bg-amber-50 text-amber-700 ring-amber-600/20"
              : color === "blue"
                ? "bg-blue-50 text-blue-700 ring-blue-600/20"
                : "bg-emerald-50 text-emerald-700 ring-emerald-600/20"
          }`}
        >
          {count}
        </span>
      )}
    </div>
  );
}
