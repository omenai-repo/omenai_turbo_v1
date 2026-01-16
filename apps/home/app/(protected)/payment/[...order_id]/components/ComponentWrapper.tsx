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

  // Modern Loading State with backdrop
  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-50/50 backdrop-blur-sm">
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

  // Polished "Unavailable" State
  if (!data!.order.availability) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-gray-50 px-6">
        <div className="max-w-md text-center space-y-3">
          <h2 className="text-xl font-medium text-gray-900">
            Artwork Unavailable
          </h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            Unfortunately, this artwork has been purchased by another customer.
          </p>
        </div>
      </div>
    );
  }

  return (
    // Main Container: Flex column to manage Navbar + Content height
    <div className="min-h-screen w-full  text-gray-900 font-sans selection:bg-black selection:text-white flex flex-col">
      {isLoggedIn ? (
        <>
          <DesktopNavbar />

          {/* Main Content Area - fills remaining height, centers child */}
          <main className="flex-1 w-full flex flex-col items-center justify-center">
            <div className="w-full h-full flex flex-col items-center justify-center max-w-[1600px] mx-auto">
              <OrderDetails order={data?.order} lock_status={data?.locked} />
            </div>
          </main>
        </>
      ) : (
        <div className="w-full h-screen flex items-center justify-center ">
          <Load />
        </div>
      )}
    </div>
  );
}
