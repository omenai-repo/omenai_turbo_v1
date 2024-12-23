"use client";
import Link from "next/link";
import NoVerificationBlock from "../../components/NoVerificationBlock";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useContext } from "react";
import { SessionContext } from "@omenai/package-provider/SessionProvider";
import { checkIsStripeOnboarded } from "@omenai/shared-services/stripe/checkIsStripeOnboarded";
import Load from "@omenai/shared-ui-components/components/loader/Load";
import { login_url } from "@omenai/url-config/src/config";

export default function NoSubscriptionTheme() {
  const { session } = useContext(SessionContext);
  const router = useRouter();
  const url = login_url();
  const { data, isLoading } = useQuery({
    queryKey: ["get_account_info"],
    queryFn: async () => {
      const response = await checkIsStripeOnboarded(
        session?.connected_account_id as string
      );

      if (!response?.isOk) {
        throw new Error("Something went wrong");
      } else {
        return response.details_submitted;
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

  if (data === undefined) router.replace(url);
  if (!data) router.replace("/gallery/payout/refresh");

  return (
    <div className=" w-full h-[78vh] grid place-items-center">
      {!session?.gallery_verified ? (
        <NoVerificationBlock
          gallery_name={session !== null ? (session?.name as string) : ""}
        />
      ) : (
        <div className="flex justify-center items-center flex-col gap-3">
          <h5>No subscriptions plans are active</h5>
          <Link href={"/gallery/billing/plans"} className="">
            <button className=" h-[40px] px-4 rounded-sm w-fit text-xs bg-dark flex gap-2 items-center">
              <span className="text-white">Create a subscription</span>
            </button>
          </Link>
        </div>
      )}
    </div>
  );
}
