"use client";

import { verifyFlwTransaction } from "@omenai/shared-services/subscriptions/verifyFlwTransaction";
import Load from "@omenai/shared-ui-components/components/loader/Load";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { IoIosLock } from "react-icons/io";

export default function VerifyTransaction({
  transaction_id,
}: {
  transaction_id: string;
}) {
  const { data: verified, isLoading } = useQuery({
    queryKey: ["verify_subscription_payment"],
    queryFn: async () => {
      const response = await verifyFlwTransaction(transaction_id);
      if (!response?.isOk) return null;
      else {
        console.log(response.data);
        return { message: response.message, data: response.data };
      }
    },
    refetchOnWindowFocus: false,
  });
  return (
    <div className="grid place-items-center">
      <div className="flex justify-between items-center mb-2 w-full">
        <h1 className="text-[14px] font-normal">Transaction verification</h1>
        <p className="text-[13px] flex items-center gap-x-1 font-bold">
          <IoIosLock />
          <span className="text-[13px]">Secure form</span>
        </p>
      </div>
      {isLoading ? (
        <div className="w-full flex flex-col justify-center items-center gap-y-4">
          <Load />
          <p className="text-[14px]">Verification in progress...please wait</p>
        </div>
      ) : (
        <div className=" mt-6 w-full flex flex-col gap-y-4">
          {/* todo: Fix verification icon */}
          <div className="space-y-3 grid place-items-center">
            <Image
              src={"/images/verified.png"}
              height={100}
              width={100}
              alt="verification icon"
              className="text-center"
            />
            <p className="text-[14px] font-bold">{verified?.message}</p>
          </div>

          <div className="w-full mt-5">
            <Link
              href={"/gallery/billing"}
              type="button"
              className="h-[40px] px-4 w-full text-white disabled:cursor-not-allowed disabled:bg-[#E0E0E0] hover:bg-dark/80 text-[14px] bg-dark duration-200 grid place-items-center"
            >
              Go home
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
