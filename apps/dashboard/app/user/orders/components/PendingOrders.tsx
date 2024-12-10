import { AnimatePresence, motion } from "framer-motion";
import { ObjectId } from "mongoose";
import OrdersCard from "./OrdersCard";
import { CreateOrderModelTypes } from "@omenai/shared-types";
import NotFoundData from "@omenai/shared-ui-components/components/notFound/NotFoundData";
import { formatIntlDateTime } from "@omenai/shared-utils/src/formatIntlDateTime";

export default function PendingOrders({
  orders,
}: {
  orders: CreateOrderModelTypes[] & {
    createdAt: string;
    updatedAt: string;
    _id: ObjectId;
  };
}) {
  return (
    <AnimatePresence key={20}>
      <motion.div
        initial={{ y: 300, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -300 }}
        transition={{ duration: 0.33 }}
        className="w-full"
      >
        {orders.length === 0 ? (
          <NotFoundData />
        ) : (
          <div className="flex flex-col gap-3 w-full">
            {orders.map((order: any) => {
              return (
                <div key={order.order_id}>
                  <OrdersCard
                    url={order.artwork_data.url}
                    title={order.artwork_data.title}
                    artist={order.artwork_data.artist}
                    price={order.artwork_data.pricing.usd_price}
                    order_date={formatIntlDateTime(order.createdAt)}
                    status={order.status}
                    order_id={order.order_id}
                    state="pending"
                    payment_information={order.payment_information}
                    tracking_information={order.tracking_information}
                    shipping_quote={order.shipping_quote}
                    delivery_confirmed={order.delivery_confirmed}
                    order_accepted={order.order_accepted}
                    availability={order.availability}
                  />
                  <hr className="h-px my-2 bg-dark/10 border-0 dark:bg-gray-700" />
                </div>
              );
            })}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
