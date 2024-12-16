"use client";

import { releaseOrderLock } from "@omenai/shared-services/orders/releaseOrderLock";
import Load from "@omenai/shared-ui-components/components/loader/Load";
import DesktopNavbar from "@omenai/shared-ui-components/components/navbar/desktop/DesktopNavbar";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function OrderCanceledPage() {
  const searchParams = useSearchParams();
  const art_id_key = searchParams.get("a_id");
  const user_id_key = searchParams.get("u_id");

  const { data: isLockReleased, isLoading } = useQuery({
    queryKey: ["get_initial_lock_status"],
    queryFn: async () => {
      const release_lock_status = await releaseOrderLock(
        art_id_key!,
        user_id_key!
      );

      if (release_lock_status?.isOk) {
        return true;
      } else {
        throw new Error("Something went wrong, please refresh your page");
      }
    },
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return (
      <div className="h-[85vh] w-full grid place-items-center">
        <Load />
      </div>
    );
  }

  return (
    <>
      <DesktopNavbar />
      <div className="w-full h-[85vh] grid place-items-center">
        <div className="p-6 grid place-items-center text-center space-y-4">
          <p className="text-base">Your transaction has been canceled</p>
          <Image
            height={100}
            width={100}
            src={"/images/done.png"}
            alt="success-icon"
          />

          <div className="flex space-x-2 items-center">
            <Link
              href="/"
              className="flex items-center whitespace-nowrap justify-center space-x-2 h-[40px] px-4 w-full bg-black text-white cursor-pointer mt-[50px] transition duration-150"
              title="Return Home"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
                  clipRule="evenodd"
                ></path>
              </svg>
              <span className="text-[14px]">Return Home</span>
            </Link>
            <Link
              href="/dashboard/user/orders"
              className="flex items-center whitespace-nowrap justify-center space-x-2 h-[40px] px-4 w-full bg-black text-white cursor-pointer mt-[50px] transition duration-150"
              title="Return Home"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
                  clipRule="evenodd"
                ></path>
              </svg>
              <span className="text-[14px]">Return to dashboard</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
