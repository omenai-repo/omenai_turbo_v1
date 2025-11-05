"use client";

import { releaseOrderLock } from "@omenai/shared-services/orders/releaseOrderLock";
import Load from "@omenai/shared-ui-components/components/loader/Load";
import DesktopNavbar from "@omenai/shared-ui-components/components/navbar/desktop/DesktopNavbar";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { dashboard_url } from "@omenai/url-config/src/config";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export function OrderCanceledPage() {
  // const searchParams = useSearchParams();
  // const art_id_key = searchParams.get("a_id");
  // const user_id_key = searchParams.get("u_id");

  // const { data: isLockReleased, isLoading } = useQuery({
  //   queryKey: ["get_initial_lock_status"],
  //   queryFn: async () => {
  //     const release_lock_status = await releaseOrderLock(
  //       art_id_key!,
  //       user_id_key!
  //     );

  //     if (release_lock_status?.isOk) {
  //       return true;
  //     } else {
  //       throw new Error("Something went wrong, please refresh your page");
  //     }
  //   },
  //   refetchOnWindowFocus: false,
  // });

  // if (isLoading) {
  //   return (
  //     <div className="h-[85vh] w-full grid place-items-center">
  //       <Load />
  //     </div>
  //   );
  // }

  const dashboard_uri: string = dashboard_url();

  return (
    <>
      <DesktopNavbar />
      <Suspense>
        <div className="w-full min-h-[85vh] flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100">
          <div className="bg-white shadow-lg rounded-2xl p-8 max-w-md w-full text-center space-y-6 animate-fade-in">
            {/* Cancel Icon */}
            <div className="flex justify-center">
              <Image
                src={"/images/cancel.png"}
                alt={"cancel icon"}
                height={100}
                width={100}
                className="animate-scale-in"
              />
            </div>

            {/* Headline */}
            <h2 className="text-xl font-semibold text-red-600">
              Transaction Canceled
            </h2>

            {/* Subtext */}
            <p className="text-sm text-gray-600 leading-relaxed">
              Your transaction has been canceled. If this was a mistake, you can
              return home or visit your dashboard to view your orders.
            </p>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-4">
              <Link
                href="/"
                className="h-[40px] px-5 rounded-lg flex items-center justify-center gap-2 bg-gray-800 text-dark text-sm font-medium shadow hover:bg-gray-700 hover:text-white transition-colors duration-200 w-full"
                title="Return Home"
              >
                Return Home
              </Link>

              <Link
                href={`${dashboard_uri}/user/orders`}
                className="h-[40px] px-5 rounded-lg flex items-center justify-center gap-2 bg-red-600 text-white text-sm font-medium shadow hover:bg-red-500 transition-colors duration-200 w-full"
                title="Return to dashboard"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </Suspense>

      {/* Mild Animations */}
      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.4s ease-out;
        }
        .animate-scale-in {
          animation: scale-in 0.5s ease-out;
        }
      `}</style>
    </>
  );
}
