import { AnimatePresence, motion } from "framer-motion";
import { ObjectId } from "mongoose";
import React from "react";
import { CreateOrderModelTypes } from "@omenai/shared-types";
import NotFoundData from "@omenai/shared-ui-components/components/notFound/NotFoundData";
import { OrdersGroupAccordion } from "./OrdersGroupAccordion";

export default function CompletedOrders({
  orders,
}: {
  orders: CreateOrderModelTypes[] & {
    createdAt: string;
    updatedAt: string;
    _id: ObjectId;
  };
}) {
  return (
    <AnimatePresence key={14}>
      <motion.div
        initial={{ y: 300, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -300 }}
        transition={{ duration: 0.33 }}
        className="w-full"
      >
        {orders.length === 0 ? (
          <div className="h-[50dvh] grid place-items-center">
            <NotFoundData />
          </div>
        ) : (
          <OrdersGroupAccordion orders={orders} tab="completed" />
        )}
      </motion.div>
    </AnimatePresence>
  );
}
