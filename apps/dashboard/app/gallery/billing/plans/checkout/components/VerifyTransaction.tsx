"use client";

import { verifyFlwTransaction } from "@omenai/shared-services/subscriptions/verifyFlwTransaction";
import Load from "@omenai/shared-ui-components/components/loader/Load";
import { QueryClient, useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { IoIosLock } from "react-icons/io";

export default function VerifyTransaction({
  transaction_id,
}: {
  transaction_id: string;
}) {
  const queryClient = useQueryClient();
  const { data: verified, isLoading } = useQuery({
    queryKey: ["verify_subscription_payment"],
    queryFn: async () => {
      const response = await verifyFlwTransaction(transaction_id);
      if (!response?.isOk) {
        return {
          message: `${response?.message}. Please contact support`,
          isOk: response?.isOk,
        };
        throw new Error("Something went wrong");
      } else {
        return {
          message: response.message,
          data: response.data,
          isOk: response.isOk,
        };
      }
    },
    refetchOnWindowFocus: false,
  });
  return (
    <div className="grid place-items-center">
      <div className="flex justify-between items-center mb-2 w-full">
        <h1 className="text-base font-bold">Transaction verification</h1>
        <p className="text-[13px] flex items-center gap-x-1 font-bold">
          <IoIosLock />
          <span className="text-[13px]">Secure form</span>
        </p>
      </div>
      {isLoading ? (
        <div className="w-full h-full flex flex-col justify-center items-center gap-y-4">
          <Load />
          <p className="text-[14px]">Verification in progress...please wait</p>
        </div>
      ) : (
        <div className=" w-[20vw] flex-flex-col space-y-6 h-[30vh] grid place-items-center">
          <div>
            <div className="space-y-5 grid place-items-center">
              <Image
                src={`/icons/${verified?.isOk ? "verified.png" : "cancel_icon.png"}`}
                height={50}
                width={50}
                alt="verification icon"
                className="text-center"
              />
              <p className="text-[14px] font-bold whitespace-nowrap">
                {verified?.message}
              </p>
            </div>

            <div className=" mt-5">
              <Link
                href={"/gallery/billing"}
                type="button"
                className="h-[35px] p-5 rounded-full w-full flex items-center justify-center gap-3 disabled:cursor-not-allowed disabled:bg-dark/10 disabled:text-[#A1A1A1] bg-dark text-white text-xs font-normal"
              >
                {verified?.isOk ? "View subscription info" : "Go back"}
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
