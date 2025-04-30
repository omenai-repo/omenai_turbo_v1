"use client";

import { releaseOrderLock } from "@omenai/shared-services/orders/releaseOrderLock";
import Load from "@omenai/shared-ui-components/components/loader/Load";
import DesktopNavbar from "@omenai/shared-ui-components/components/navbar/desktop/DesktopNavbar";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { dashboard_url } from "@omenai/url-config/src/config";

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
  const dashboard_uri: string = dashboard_url();

  return (
    <>
      <DesktopNavbar />
      <div className="w-full h-[85vh] grid place-items-center">
        <div className="p-6 grid place-items-center text-center space-y-4">
          <Image
            src={"/images/cancel.png"}
            alt={"cancel icon"}
            height={100}
            width={100}
          />
          <p className="text-base font-medium">
            Your transaction has been canceled
          </p>

          <div className="flex flex-col space-y-2 items-center">
            <Link
              href="/"
              className="h-[35px] p-5 rounded-full w-full flex items-center justify-center gap-3 disabled:cursor-not-allowed disabled:bg-dark/10 disabled:text-[#A1A1A1] bg-dark text-white text-[14px] font-normal"
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
              <span className="text-[14px] whitespace-nowrap">Return Home</span>
            </Link>
            <Link
              href={`${dashboard_uri}/user/orders`}
              className="h-[35px] p-5 rounded-full w-full flex items-center justify-center gap-3 disabled:cursor-not-allowed disabled:bg-dark/10 disabled:text-[#A1A1A1] bg-dark text-white text-[14px] font-normal"
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
              <span className="text-[14px] whitespace-nowrap">
                Return to dashboard
              </span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
