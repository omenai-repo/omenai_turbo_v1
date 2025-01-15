"use client";
import { getOverviewOrders } from "@omenai/shared-services/orders/getOverviewOrders";
import OverviewComponentCard from "../../components/OverviewComponentCard";
import OverviewOrdersCard from "../../../components/OverviewOrdersCard";

import Link from "next/link";
import { IoIosArrowRoundForward } from "react-icons/io";
import { useQuery } from "@tanstack/react-query";
import Load from "@omenai/shared-ui-components/components/loader/Load";
import NotFoundData from "@omenai/shared-ui-components/components/notFound/NotFoundData";
import { formatIntlDateTime } from "@omenai/shared-utils/src/formatIntlDateTime";
import { CreateOrderModelTypes } from "@omenai/shared-types";

export default function Orders() {
  const { data: orders, isLoading } = useQuery({
    queryKey: ["get_overview_order"],
    queryFn: async () => {
      const orders = await getOverviewOrders();
      if (orders?.isOk) {
        return orders.data;
      }
    },
    refetchOnWindowFocus: false,
  });

  if (isLoading)
    return (
      <div className="h-[40vh] grid place-items-center">
        <Load />
      </div>
    );

  const limitedOrders = orders!.filter(
    (order: any) => order.order_accepted.status === ""
  );
  return (
    <OverviewComponentCard
      fullWidth={false}
      title={"Recent orders"}
      id="tour-footer"
      data-tg-tour="Welcome to the tour"
    >
      {isLoading && <div>!</div>}

      {orders!.length === 0 ? (
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
              className="text-dark/80 flex gap-x-1 text-[14px] items-center mt-4 cursor-pointer"
            >
              View {limitedOrders.length} pending orders
              <IoIosArrowRoundForward />
            </Link>
          </div>
        </>
      )}
    </OverviewComponentCard>
  );
}
