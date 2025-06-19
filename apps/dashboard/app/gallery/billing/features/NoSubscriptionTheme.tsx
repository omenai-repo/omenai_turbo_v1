"use client";
import Link from "next/link";
import NoVerificationBlock from "../../components/NoVerificationBlock";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useContext } from "react";
import { checkIsStripeOnboarded } from "@omenai/shared-services/stripe/checkIsStripeOnboarded";
import Load from "@omenai/shared-ui-components/components/loader/Load";
import { auth_uri } from "@omenai/url-config/src/config";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";

export default function NoSubscriptionTheme() {
  const { user } = useAuth({ requiredRole: "gallery" });
  const router = useRouter();
  const url = auth_uri();
  const { data, isLoading } = useQuery({
    queryKey: ["get_account_info"],
    queryFn: async () => {
      const response = await checkIsStripeOnboarded(
        user.connected_account_id as string
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
  if (!data)
    router.replace(`/gallery/payouts/refresh?id=${user.connected_account_id}`);

  return (
    <div className=" w-full h-[78vh] grid place-items-center">
      {!user.gallery_verified ? (
        <NoVerificationBlock gallery_name={user.name as string} />
      ) : (
        <div className="flex justify-center items-center flex-col gap-3">
          <h5>No subscriptions plans are active</h5>
          <Link href={"/gallery/billing/plans"} className="">
            <button className="bg-dark whitespace-nowrap hover:bg-dark/80 disabled:cursor-not-allowed text-white focus:ring ring-1 border-0 ring-dark/20 focus:ring-white duration-300 outline-none focus:outline-none disabled:bg-dark/10 disabled:text-white rounded-full h-[35px] p-5 w-full text-center text-fluid-xs flex items-center justify-center hover:ring-white cursor-pointer">
              <span className="text-white">Create a subscription</span>
            </button>
          </Link>
        </div>
      )}
    </div>
  );
}
