"use client";
import { useSearchParams, notFound } from "next/navigation";

import OrderDetails from "./OrderDetails";
import { checkLockStatus } from "@omenai/shared-services/orders/checkLockStatus";
import { getSingleOrder } from "@omenai/shared-services/orders/getSingleOrder";
import { useQuery } from "@tanstack/react-query";
import { IndividualSchemaTypes } from "@omenai/shared-types";
import Load from "@omenai/shared-ui-components/components/loader/Load";
import DesktopNavbar from "@omenai/shared-ui-components/components/navbar/desktop/DesktopNavbar";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
export default function ComponentWrapper({
  order_id,
  isLoggedIn,
}: {
  order_id: string;
  isLoggedIn: boolean;
}) {
  const { user } = useAuth({ requiredRole: "gallery" });

  const searchParams = useSearchParams();
  const user_id_key = searchParams.get("id_key");

  const { data, isLoading } = useQuery({
    queryKey: ["load_order_purchase_data"],
    queryFn: async () => {
      const data = await getSingleOrder(order_id);

      if (data?.isOk) {
        const lock_status = await checkLockStatus(
          data.data.artwork_data.art_id,
          user.id
        );

        return { order: data.data, locked: lock_status?.data.locked };
      } else {
        throw new Error("Uh oh! Something went wrong!");
      }
    },
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return (
      <div className="w-full h-[80vh] grid place-items-center">
        <Load />
      </div>
    );
  }
  if (data!.order.buyer_details.id !== user_id_key) notFound();

  if (data!.order === null) throw new Error("Something went wrong");
  if (
    data!.order.payment_information.status === "completed" ||
    data!.order.order_accepted.status === "" ||
    data!.order.order_accepted.status === "declined"
  )
    notFound();
  if (!data!.order.availability) {
    return (
      <div className="w-[95vh] h-full grid place-items-center">
        <p className="text-fluid-xxs font-semibold">
          Unfortunately, this artwork has been purchased by another customer
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-screen">
      {isLoggedIn ? (
        <>
          <DesktopNavbar />
          <div className="w-full h-[80vh] grid place-items-center ">
            <OrderDetails order={data?.order} lock_status={data?.locked} />
          </div>
        </>
      ) : (
        <div className="w-full h-screen grid place-items-center">
          <Load />
        </div>
      )}
    </div>
  );
}
