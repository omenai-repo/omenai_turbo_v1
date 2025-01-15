"use client";
import Image from "next/image";
import { notFound, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { verifyFlwTransaction } from "@omenai/shared-services/subscriptions/verifyFlwTransaction";
import Link from "next/link";
import { useReadLocalStorage } from "usehooks-ts";
import Load from "@omenai/shared-ui-components/components/loader/Load";
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
      if (!response?.isOk) throw new Error("Something went wrong");
      else {
        return { message: response.message, data: response.data };
      }
    },
    refetchOnWindowFocus: false,
  });

  console.log(verified?.data);

  return (
    <>
      <PageTitle title="Verifying your transaction" />
      <div className="grid place-items-center w-full h-[65vh]">
        {isLoading ? (
          <div className=" w-[20vw] flex flex-col items-center justify-center space-y-6">
            <Load />
            <p className="text-[14px] font-normal">
              Verification in progress...please wait
            </p>
          </div>
        ) : (
          <div className=" w-[20vw] flex-flex-col space-y-6">
            <div className="space-y-2 grid place-items-center">
              <Image
                src={"/images/verified.png"}
                height={100}
                width={100}
                alt="verification icon"
                className="text-center"
              />
              <p className="text-[14px] font-bold">{verified?.message}</p>
            </div>

            <div className=" mt-5">
              <Link
                href={"/gallery/billing"}
                type="button"
                className="h-[40px] px-4 w-full text-white disabled:cursor-not-allowed disabled:bg-[#E0E0E0] hover:bg-dark/80 text-[14px] bg-dark duration-200 grid place-items-center"
              >
                View subscription info
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
