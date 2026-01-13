"use client";
import { useQuery } from "@tanstack/react-query";
import Lottie from "lottie-react";
import { useRouter, useSearchParams } from "next/navigation";
import animationData from "@omenai/shared-json/src/order-received.json";

import { useLocalStorage, useReadLocalStorage } from "usehooks-ts";
import { getApiUrl } from "@omenai/url-config/src/config";
import { handleError } from "@omenai/shared-utils/src/handleQueryError";
import { LoadSmall } from "@omenai/shared-ui-components/components/loader/Load";
import { useRollbar } from "@rollbar/react";

export default function VerifyTransactionWrapper() {
  const searchParams = useSearchParams();
  const rollbar = useRollbar();
  const transaction_id = searchParams.get("transaction_id");
  const [pur_gid, set_pur_gid] = useLocalStorage<{
    gid: string;
    oid: string;
  } | null>("pur_gid", { gid: "", oid: "" });

  const ids: { gid: string; oid: string } | null =
    useReadLocalStorage("pur_gid");

  const url = getApiUrl();
  const router = useRouter();

  const { data: verify_data, isLoading } = useQuery({
    queryKey: ["verify_transaction"],
    queryFn: async () => {
      try {
        if (!transaction_id || !ids?.gid || !ids?.oid) {
          throw new Error(
            "Missing required parameters for transaction verification"
          );
        }

        const response = await fetch(
          "/api/purchase/verify_artwork_purchase_transaction",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              transaction_id,
              gallery_id: ids.gid,
              order_id: ids.oid,
            }),
          }
        );

        if (!response.ok) {
          const errorResult = await response.json();
          throw new Error(
            errorResult.message || "Transaction verification failed"
          );
        }

        const result = await response.json();
        return { message: result.message, isOk: true };
      } catch (error) {
        if (error instanceof Error) {
          rollbar.error(error);
        } else {
          rollbar.error(new Error(String(error)));
        }
        console.error("Verification Error:", error);
        handleError();
      }
    },
    refetchOnWindowFocus: false,
  });

  function handleRedirect() {
    set_pur_gid(null);
    router.replace("/dashboard/user/orders");
  }
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
    <div className="w-full max-w-xl min-w-auto h-[80vh] grid place-items-center">
      {verify_data?.isOk && verify_data.message === "Transaction successful" ? (
        <div className="px-8 py-16 rounded border border-dark/20">
          <div className="flex flex-col items-center gap-1 text-center">
            <h1>{verify_data?.message}</h1>
            <Lottie
              animationData={animationData}
              className="w-[200px] h-[200px]"
            />
            <p className="text-dark">
              Your transaction has been successfully confirmed.
            </p>
            <p className="text-dark">Thank you!</p>
            <div>
              <button
                onClick={handleRedirect}
                className=" h-[35px] px-4 bg-dark text-white"
              >
                Go to dashboard
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-5 rounded border border-dark/20">
          <h1>{verify_data?.message}</h1>
        </div>
      )}

      <p>
        You&apos;ll be required to log back in, redirecting you in a
        moment...please wait!!
      </p>
    </div>
  );
}
