"use client";
import PageTitle from "../../components/PageTitle";
import { useRouter, useSearchParams } from "next/navigation";
import { useContext, useState } from "react";
import { createAccountLink } from "@omenai/shared-services/stripe/createAccountLink";
import { toast } from "sonner";
import { checkIsStripeOnboarded } from "@omenai/shared-services/stripe/checkIsStripeOnboarded";
import { useQuery } from "@tanstack/react-query";
import {
  SessionContext,
  useSession,
} from "@omenai/package-provider/SessionProvider";
import Load, {
  LoadSmall,
} from "@omenai/shared-ui-components/components/loader/Load";

export default function RefreshStripe() {
  const { session } = useContext(SessionContext);
  const searchParams = useSearchParams();
  const account_Id = searchParams.get("id");
  const router = useRouter();
  const [accountLinkCreatePending, setAccountLinkCreatePending] =
    useState(false);

  const { data: isConfirmed, isLoading } = useQuery({
    queryKey: ["check_stripe_onboarded"],
    queryFn: async () => {
      const response = await checkIsStripeOnboarded(account_Id!);

      if (response?.isOk) {
        return {
          isSubmitted: response.details_submitted,
        };
      } else {
        throw new Error("Something went wrong, Please refresh the page");
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

  if (isConfirmed!.isSubmitted) router.replace(`/gallery/payouts`);

  async function handleAccountLink() {
    setAccountLinkCreatePending(true);
    const response = await createAccountLink(account_Id!);

    if (response?.isOk) {
      toast.success("Operation successful", {
        description: "Account link created successfully... Redirecting!",
        style: {
          background: "green",
          color: "white",
        },
        className: "class",
      });
      router.replace(response.url);
    } else {
      toast.error("Error notification", {
        description:
          "Something went wrong, please try again or contact support",
        style: {
          background: "red",
          color: "white",
        },
        className: "class",
      });
    }
  }
  return (
    <div>
      <PageTitle title="Stripe Onboarding" />
      {isConfirmed?.isSubmitted ? (
        <div className="h-[85vh] w-full grid place-items-center">
          <div className="flex flex-col space-y-1">
            <Load />
            <p className="text-[14px] font-semibold">
              Redirecting...Please wait
            </p>
          </div>
        </div>
      ) : (
        <div className="grid place-items-center h-[78vh]">
          <div className="bg-white border border-[#E0E0E0] text-dark p-6 rounded-lg w-full max-w-xl shadow-xl cursor-default relative">
            <h1 className="text-[14px] font-normal text-[#858585] mb-1">
              Looks like you didn&apos;t complete your Stripe Onboarding.
            </h1>
            <p className="font-bold text-sm">
              Create a connected account on{" "}
              <span className="text-[#5247ee]">Stripe</span>
            </p>
            <div className="flex flex-col space-y-2 mt-5">
              <div className="relative w-full">
                <label
                  className="text-[#858585] font-normal text-xs mb-2"
                  htmlFor="name"
                >
                  Name
                </label>
                <input
                  disabled
                  type="text"
                  value={session?.name}
                  className="p-3 border border-[#E0E0E0] text-xs disabled:cursor-not-allowed disabled:bg-gray-400 disabled:text-[#A1A1A1] placeholder:text-[#858585] placeholder:text-xs bg-white  w-full focus:border-none focus:ring-1 focus:ring-dark focus:outline-none"
                />
              </div>
              <div className="relative w-full">
                <label
                  className="text-[#858585] font-normal text-xs mb-2"
                  htmlFor="email"
                >
                  Email
                </label>
                <input
                  disabled
                  type="text"
                  value={session?.email}
                  className="p-3 border border-[#E0E0E0] text-xs disabled:cursor-not-allowed disabled:bg-gray-400 disabled:text-[#A1A1A1] placeholder:text-[#858585] placeholder:text-xs bg-white  w-full focus:border-none focus:ring-1 focus:ring-dark focus:outline-none"
                />
              </div>
            </div>
            <>
              <p className="text-[14px] font-normal mt-4">
                Your connected account ID is:{" "}
                <code className="font-bold">{account_Id}</code>{" "}
              </p>
            </>
            <button
              disabled={accountLinkCreatePending}
              className="h-[40px] text-[14px] font-normal disabled:cursor-not-allowed disabled:bg-gray-400 disabled:text-[#A1A1A1] px-4 w-full bg-black text-white cursor-pointer mt-5 grid place-items-center"
              onClick={handleAccountLink}
            >
              {accountLinkCreatePending ? (
                <LoadSmall />
              ) : (
                "Complete Stripe Onboarding"
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
