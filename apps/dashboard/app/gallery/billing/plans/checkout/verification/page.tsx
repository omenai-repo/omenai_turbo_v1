"use client";
import Image from "next/image";
import { notFound, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { verifyFlwTransaction } from "@omenai/shared-services/subscriptions/verifyFlwTransaction";
import Link from "next/link";
import { useLocalStorage, useReadLocalStorage } from "usehooks-ts";
import Load, {
  LoadIcon,
} from "@omenai/shared-ui-components/components/loader/Load";
import PageTitle from "../../../../components/PageTitle";
export default function TransactionVerification() {
  const transaction_id = useReadLocalStorage("flw_trans_id") as string;

  if (
    transaction_id === undefined ||
    transaction_id === null ||
    transaction_id === ""
  )
    notFound();

  const { data: verified, isLoading } = useQuery({
    queryKey: ["verify_subscription_payment_on_redirect"],
    queryFn: async () => {
      const response = await verifyFlwTransaction(transaction_id);
      console.log(response);
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
    <>
      <PageTitle title="Verifying your transaction" />
      <div className="grid place-items-center w-full h-[65vh]">
        {isLoading ? (
          <div className=" w-[20vw] flex flex-col items-center justify-center space-y-6">
            <LoadIcon />
            <p className="text-[14px] font-medium whitespace-nowrap">
              Verification in progress...please wait
            </p>
          </div>
        ) : (
          <div className=" w-[20vw] flex-flex-col space-y-6">
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

            {verified?.isOk && (
              <div className=" mt-5">
                <Link
                  href={"/gallery/billing"}
                  type="button"
                  className="h-[40px] p-6 rounded-full w-full flex items-center justify-center gap-3 disabled:cursor-not-allowed disabled:bg-dark/10 disabled:text-[#A1A1A1] bg-dark text-white text-[14px] font-normal"
                >
                  View subscription info
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
