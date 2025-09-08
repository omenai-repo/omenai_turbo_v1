"use client";
import { country_codes } from "@omenai/shared-json/src/country_alpha_2_codes";

import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useContext, useState } from "react";
import { toast } from "sonner";
import { createConnectedAccount } from "@omenai/shared-services/stripe/createConnectedAccount";
import { createAccountLink } from "@omenai/shared-services/stripe/createAccountLink";
import { LoadSmall } from "@omenai/shared-ui-components/components/loader/Load";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
export default function GetStartedWithStripe() {
  const [accountCreatePending, setAccountCreatePending] = useState(false);

  const [countrySelect, setCountrySelect] = useState<string>("");

  const [accountLinkCreatePending, setAccountLinkCreatePending] =
    useState(false);

  const [connectedAccountId, setConnectedAccountId] = useState();

  const { user, csrf } = useAuth({ requiredRole: "gallery" });

  const router = useRouter();

  async function handleButtonClick(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setAccountCreatePending(true);
    const customer = {
      name: user.name as string,
      email: user.email as string,
      customer_id: user.gallery_id as string,
      country: countrySelect,
    };
    const response = await createConnectedAccount(customer, csrf || "");

    if (response?.isOk) {
      setConnectedAccountId(response.account_id);
      toast.success("Operation successful", {
        description:
          "Connected account created successfully, Please continue with Onboarding",
        style: {
          background: "green",
          color: "white",
        },
        className: "class",
      });
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
    setAccountCreatePending(false);
  }

  async function handleAccountLink() {
    setAccountLinkCreatePending(true);
    const response = await createAccountLink(connectedAccountId!, csrf || "");

    if (response?.isOk) {
      toast.success("Operation successful", {
        description: "Account link created successfully... Redirecting!",
        style: {
          background: "green",
          color: "white",
        },
        className: "class",
      });
      router.push(response.url);
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
    <AnimatePresence key={9}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="bg-slate-900/20 backdrop-blur py-8 px-2 fixed inset-0 z-50 grid place-items-center cursor-pointer"
      >
        <motion.div
          initial={{ scale: 0, rotate: "12.5deg" }}
          animate={{ scale: 1, rotate: "0deg" }}
          exit={{ scale: 0, rotate: "0deg" }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white border border-[#E0E0E0] text-dark p-6 rounded-lg w-full max-w-xl shadow-xl cursor-default relative"
        >
          <div className="">
            <h1 className="text-fluid-xs font-light text-[#858585] mb-1">
              Let&apos;s get you setup to receive payments!
            </h1>
            <p className="font-bold text-fluid-sm">
              Create a connected account on{" "}
              <span className="text-[#5247ee]">Stripe</span>
            </p>
            <form
              className="flex flex-col space-y-2 mt-5"
              onSubmit={handleButtonClick}
            >
              <div className="relative w-full">
                <label
                  className="text-[#858585] font-normal text-fluid-xs mb-2"
                  htmlFor="name"
                >
                  Name
                </label>
                <input
                  disabled
                  type="text"
                  value={user.name}
                  className="w-full disabled:bg-dark/10 disabled:cursor-not-allowed disabled:text-[#fafafa] focus:ring ring-1 border-0 ring-dark/20 outline-none focus:outline-none focus:ring-dark transition-all duration-200 ease-in-out h-[35px] p-5 rounded-md placeholder:text-dark/40"
                />
              </div>
              <div className="relative w-full">
                <label
                  className="text-[#858585] font-normal text-fluid-xs mb-2"
                  htmlFor="email"
                >
                  Email
                </label>
                <input
                  disabled
                  type="text"
                  value={user.email}
                  className="w-full disabled:bg-dark/10 disabled:cursor-not-allowed disabled:text-[#fafafa] focus:ring ring-1 border-0 ring-dark/20 outline-none focus:outline-none focus:ring-dark transition-all duration-200 ease-in-out h-[35px] p-5 rounded-md placeholder:text-dark/40"
                />
              </div>
              <div className="relative w-full flex flex-col">
                <label
                  className="text-[#858585] font-normal text-fluid-xs mb-2"
                  htmlFor="email"
                >
                  Business Location
                </label>
                <select
                  required
                  onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                    setCountrySelect(e.target.value)
                  }
                  className="border-0 ring-1 ring-dark/20 focus:ring text-fluid-xxs focus:ring-dark px-6 py-2 sm:py-3 rounded-md"
                >
                  <option value="">Select</option>
                  {country_codes.map((country, index) => {
                    return (
                      <option
                        className="p-3 font-light text-dark"
                        value={country.code}
                        key={country.code}
                      >
                        {country.name}
                      </option>
                    );
                  })}
                </select>
              </div>
              {(connectedAccountId ||
                accountCreatePending ||
                accountLinkCreatePending) && (
                <div className="dev-callout">
                  {connectedAccountId && (
                    <div className="my-5">
                      <p className="text-fluid-xs font-normal">
                        Your connected account ID is:{" "}
                        <code className="font-bold">
                          {connectedAccountId}
                        </code>{" "}
                      </p>
                      <span className="text-fluid-xs my-3 font-medium">
                        Hey, don&apos;t worry, we&apos;ll remember it for you!
                      </span>
                    </div>
                  )}
                  {accountCreatePending && (
                    <p className="text-fluid-xs font-bold mt-6">
                      Creating a connected account for you...
                    </p>
                  )}
                  {accountLinkCreatePending && (
                    <p className="text-fluid-xs font-bold mt-6">
                      Creating a new Account Link for you...
                    </p>
                  )}
                </div>
              )}
              {!connectedAccountId && (
                <button
                  type="submit"
                  disabled={accountCreatePending}
                  className="h-[35px] p-5 rounded-md my-4 w-full flex items-center justify-center gap-3 disabled:cursor-not-allowed disabled:bg-dark/10 disabled:text-[#A1A1A1] bg-dark text-white text-fluid-xs font-normal"
                >
                  {accountCreatePending ? (
                    <LoadSmall />
                  ) : (
                    "Create a connected account"
                  )}
                </button>
              )}
            </form>

            {connectedAccountId && (
              <button
                disabled={accountLinkCreatePending}
                className="h-[35px] p-5 rounded-md w-full flex items-center justify-center gap-3 disabled:cursor-not-allowed disabled:bg-dark/10 disabled:text-[#A1A1A1] bg-dark text-white text-fluid-xs font-normal"
                onClick={handleAccountLink}
              >
                {accountLinkCreatePending ? (
                  <LoadSmall />
                ) : (
                  "Continue to Stripe Onboarding"
                )}
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
