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
    <div className="w-full">
      {/* Design 1: Modern Card-based Tabs */}
      <div className="bg-white rounded shadow-sm border border-slate-200 overflow-hidden">
        <Tabs
          color="#3b82f6"
          variant="default"
          radius="md"
          orientation="vertical"
          defaultValue="pending"
          className="flex min-h-[600px]"
        >
          {/* Sidebar */}
          <div className="w-72 bg-slate-50 border-r border-slate-200">
            <div className="p-6">
              <h2 className="text-fluid-base font-medium text-slate-900 mb-1">
                Order Management
              </h2>
              <p className="text-fluid-xxs text-slate-600 mb-6">
                Track and manage your orders
              </p>

              <Tabs.List className="space-y-2">
                <Tabs.Tab
                  value="pending"
                  className="w-full px-4 py-3 rounded flex items-center gap-3 text-left transition-all data-[active]:bg-white data-[active]:shadow-sm data-[active]:text-blue-600 hover:bg-white/50"
                >
                  <div className="p-2 rounded bg-amber-100 flex gap-x-2 items-center data-[active]:bg-amber-500">
                    <PackageMinus
                      size={20}
                      className="text-amber-600 data-[active]:text-white"
                      strokeWidth={1.5}
                    />
                    <p className="font-normal text-dark text-fluid-xxs flex items-center gap-x-2">
                      <span>Pending Orders </span>
                      <span className="text-fluid-xxs font-normal text-white grid place-items-center h-5 w-5  bg-dark rounded-full">
                        {pending_orders.length}
                      </span>
                    </p>
                  </div>
                </Tabs.Tab>

                <Tabs.Tab
                  value="processing"
                  className="w-full px-4 py-3 rounded flex items-center gap-3 text-left transition-all data-[active]:bg-white data-[active]:shadow-sm data-[active]:text-blue-600 hover:bg-white/50"
                >
                  <div className="p-2 rounded bg-blue-100 flex gap-x-1 items-center data-[active]:bg-blue-500">
                    <PackageSearch
                      size={20}
                      className="text-blue-600 data-[active]:text-white"
                      strokeWidth={1.5}
                    />
                    <p className="font-normal text-dark text-fluid-xxs flex items-center gap-x-2">
                      <span>In progress </span>
                      <span className="text-fluid-xxs font-normal text-white grid place-items-center h-5 w-5  bg-dark rounded-full">
                        {processing_orders.length}
                      </span>
                    </p>
                  </div>
                </Tabs.Tab>

                <Tabs.Tab
                  value="completed"
                  className="w-full px-4 py-3 rounded flex items-center gap-3 text-left transition-all data-[active]:bg-white data-[active]:shadow-sm data-[active]:text-green-600 hover:bg-white/50"
                >
                  <div className="p-2 rounded bg-green-100 flex items-center gap-x-1 data-[active]:bg-green-500">
                    <PackageCheck
                      size={20}
                      className="text-green-600 data-[active]:text-white"
                      strokeWidth={1.5}
                    />
                    <p className="font-normal text-dark text-fluid-xxs flex items-center gap-x-2">
                      <span>Completed Orders </span>
                      <span className="text-fluid-xxs font-normal text-white grid place-items-center h-5 w-5  bg-dark rounded-full">
                        {completed_orders.length}
                      </span>
                    </p>
                  </div>
                </Tabs.Tab>
              </Tabs.List>
            </div>

            {/* Summary Stats */}
            <div className="px-6 pb-6">
              <div className="bg-white rounded p-4 border border-slate-200">
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-3">
                  Overview
                </p>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-fluid-xxs font-medium text-slate-600">
                      Total Orders
                    </span>
                    <span className="text-sm font-semibold text-slate-900">
                      {pending_orders.length +
                        processing_orders.length +
                        completed_orders.length}
                    </span>
                  </div>

                  {/* DONE: comment this out */}
                  {/* <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">This Month</span>
                    <span className="text-sm font-semibold text-green-600">
                      +12%
                    </span>
                  </div> */}
                </div>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 p-8">
            <Tabs.Panel value="pending">
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-fluid-base font-medium text-slate-900">
                    Pending Orders
                  </h3>
                </div>
                <PendingOrders orders={pending_orders} />
              </div>
            </Tabs.Panel>

            <Tabs.Panel value="processing">
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-fluid-base font-medium text-slate-900">
                    Orders in Progress
                  </h3>
                </div>
                <ProcessingOrders orders={processing_orders} />
              </div>
            </Tabs.Panel>

            <Tabs.Panel value="completed">
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-fluid-base font-medium text-slate-900">
                    Completed Orders
                  </h3>
                </div>
                <CompletedOrders orders={completed_orders} />
              </div>
            </Tabs.Panel>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
