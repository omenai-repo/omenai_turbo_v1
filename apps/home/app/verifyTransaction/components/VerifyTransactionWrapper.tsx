"use client";
import { LoadSmall } from "@omenai/shared-ui-components/components/loader/Load";
import { handleError } from "@omenai/shared-utils/src/handleQueryError";
import { dashboard_url, getApiUrl } from "@omenai/url-config/src/config";
import { useQuery } from "@tanstack/react-query";
import Lottie from "lottie-react";
import { useSearchParams } from "next/navigation";

import { useLocalStorage } from "usehooks-ts";
import animationData from "@omenai/shared-json/src/order-received.json";
import Link from "next/link";
import { Paper } from "@mantine/core";
import Image from "next/image";
export default function VerifyTransactionWrapper() {
  const searchParams = useSearchParams();
  const transaction_id = searchParams.get("transaction_id");

  const url = getApiUrl();

  const {
    data: verify_data,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["verify_transaction"],
    queryFn: async () => {
      try {
        const response = await fetch(
          `${url}/api/transactions/verify_FLW_transaction`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" }, // Add appropriate header
            body: JSON.stringify({ transaction_id }),
          }
        );
        const result = await response.json();

        return { message: result.message, isOk: response.ok };
      } catch (error) {
        console.error("Error verifying transaction:", error);
        handleError();
      }
    },
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return (
      <div className="w-full h-[80vh] grid place-items-center">
        <div className="flex flex-col gap-y-1 justify-center items-center">
          <p>Verifying transaction status</p>
          <LoadSmall />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[80vh] grid place-items-center">
      <div>
        {verify_data?.isOk &&
        verify_data.message === "Transaction successful" ? (
          <Paper
            withBorder
            radius={"md"}
            className="w-full h-full space-y-8 px-8 py-16 grid place-items-center"
          >
            <Image
              src={"/images/success.png"}
              alt="Success icon"
              height={100}
              width={100}
              unoptimized
            />
            <div className="w-full flex flex-col space-y-6 text-center">
              <h5 className="font-semibold">
                Transaction verified successfully
              </h5>
              <p className="text-fluid-xxs font-medium">
                {verify_data?.message}
              </p>
              <div className="flex gap-x-4 justify-center w-full mt-10">
                <Link href={"/"}>
                  <button className="h-[35px] w-[250px] p-5 rounded-full flex items-center justify-center gap-3 disabled:cursor-not-allowed disabled:bg-dark/10 disabled:text-[#A1A1A1] bg-dark text-white text-fluid-xs font-normal">
                    Go Home
                  </button>
                </Link>
                <Link href={`${dashboard_url()}/user/orders`}>
                  <button className="h-[35px] p-5 rounded-full  w-[250px] flex items-center justify-center gap-3 disabled:cursor-not-allowed disabled:bg-dark/10 disabled:text-[#A1A1A1] bg-dark text-white text-fluid-xs font-normal">
                    Return to Dashboard
                  </button>
                </Link>
              </div>
            </div>
          </Paper>
        ) : (
          <>
            <div className="p-5 rounded-md border text-center text-red-600 border-dark/20">
              <h1>{verify_data?.message}</h1>
            </div>
            <div className="flex gap-x-4 justify-center w-full mt-10">
              <Link href={"/"}>
                <button className="h-[35px] p-5 rounded-full  w-[250px] flex items-center justify-center gap-3 disabled:cursor-not-allowed disabled:bg-dark/10 disabled:text-[#A1A1A1] bg-dark text-white text-fluid-xs font-normal">
                  Go Home
                </button>
              </Link>
              <Link href={`${dashboard_url()}/user/orders`}>
                <button className="h-[35px] p-5 rounded-full  w-[250px] flex items-center justify-center gap-3 disabled:cursor-not-allowed disabled:bg-dark/10 disabled:text-[#A1A1A1] bg-dark text-white text-fluid-xs font-normal">
                  Return to Dashboard
                </button>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
