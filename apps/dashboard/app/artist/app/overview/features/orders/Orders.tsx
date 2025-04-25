"use client";
import { getOrderByFilter } from "@omenai/shared-services/orders/getOrdersByFilter";
import OverviewComponentCard from "../../components/OverviewComponentCard";
import OverviewOrdersCard from "../../../components/OverviewOrdersCard";

import Link from "next/link";
import { IoIosArrowRoundForward } from "react-icons/io";
import { useQuery } from "@tanstack/react-query";
import Load, {
  LoadIcon,
} from "@omenai/shared-ui-components/components/loader/Load";
import NotFoundData from "@omenai/shared-ui-components/components/notFound/NotFoundData";
import { formatIntlDateTime } from "@omenai/shared-utils/src/formatIntlDateTime";
import { ArtistSchemaTypes, CreateOrderModelTypes } from "@omenai/shared-types";
import { useSession } from "@omenai/package-provider/SessionProvider";
import { OrdersAccordion } from "./OrdersAccordion";

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

  if (isLoading)
    return (
      <div className="h-[40vh] grid place-items-center">
        <LoadIcon />
      </div>
    );

  return (
    <OverviewComponentCard
      fullWidth={false}
      title={"Recent orders"}
      id="tour-footer"
      data-tg-tour="Welcome to the tour"
    >
      <OrdersAccordion orders={orders} />
      {/* {orders!.length === 0 ? (
        <NotFoundData />
      ) : (
        <>
          <div className="flex flex-col gap-3 w-full">
            {limitedOrders
              .slice(0, 2)
              .map((order: CreateOrderModelTypes, index: number) => {
                return (
                  <OverviewOrdersCard
                    key={order.order_id}
                    url={order.artwork_data.url}
                    title={order.artwork_data.title}
                    artist={order.artwork_data.artist}
                    order_date={formatIntlDateTime(order.createdAt)}
                    status={order.status}
                  />
                );
              })}
          </div>
          <div className="w-full flex justify-center my-4">
            <Link
              href="/gallery/orders"
              className="text-gray-700/80 flex gap-x-1 text-[14px] items-center font-medium underline mt-4 cursor-pointer"
            >
              View {limitedOrders.length} pending order(s)
              <IoIosArrowRoundForward />
            </Link>
          </div>
        </>
      )} */}
    </OverviewComponentCard>
  );
}
