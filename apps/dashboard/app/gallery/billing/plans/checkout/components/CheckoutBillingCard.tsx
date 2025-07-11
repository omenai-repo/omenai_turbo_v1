"use client";
import React, { useContext, useState } from "react";
import { IoIosLock } from "react-icons/io";
import Image from "next/image";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocalStorage } from "usehooks-ts";
import { updateSubscriptionPlan } from "@omenai/shared-services/subscriptions/updateSubscriptionPlan";
import Link from "next/link";
import {
  SubscriptionPlanDataTypes,
  SubscriptionModelSchemaTypes,
  SubscriptionTokenizationTypes,
  NextChargeParams,
} from "@omenai/shared-types";
import { LoadSmall } from "@omenai/shared-ui-components/components/loader/Load";
import { generateAlphaDigit } from "@omenai/shared-utils/src/generateToken";
import { getApiUrl } from "@omenai/url-config/src/config";
import { createTokenizedCharge } from "@omenai/shared-services/subscriptions/createTokenizedCharge";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";

export default function CheckoutBillingCard({
  plan,
  interval,
  sub_data,
  amount,
  shouldCharge,
}: {
  plan: SubscriptionPlanDataTypes & {
    createdAt: string;
    updatedAt: string;
    _id: string;
  };
  sub_data: SubscriptionModelSchemaTypes & {
    created: string;
    updatedAt: string;
  };
  interval: string;
  amount: number;
  shouldCharge: boolean;
}) {
  const { user } = useAuth({ requiredRole: "gallery" });
  const [transaction_id, set_transaction_id] = useLocalStorage(
    "flw_trans_id",
    ""
  );
  const [error, setError] = useState<string>("");
  const searchParams = useSearchParams();
  const plan_action = searchParams.get("plan_action");
  const { csrf } = useAuth({ requiredRole: "gallery" });
  const [loading, setLoading] = useState<boolean>(false);
  const [migrationLoading, setMigrationLoading] = useState<boolean>(false);

  const router = useRouter();

  const url = getApiUrl();

  async function handlePayNow() {
    setError("");
    const tokenized_data: SubscriptionTokenizationTypes = {
      amount,
      email: sub_data.customer.email,
      tx_ref: generateAlphaDigit(7),
      token: sub_data.card.token,
      gallery_id: sub_data.customer.gallery_id,
      plan_id: plan._id.toString(),
      plan_interval: interval,
    };
    setLoading(true);
    const tokenize_card = await createTokenizedCharge(
      tokenized_data,
      csrf || ""
    );

    if (!tokenize_card?.isOk)
      toast.error("Error notification", {
        description: "Unable to initiate card charge. Please contact support",
        style: {
          background: "red",
          color: "white",
        },
        className: "class",
      });
    else {
      const { data } = tokenize_card;
      if (data.status === "error") setError(data.message);
      else {
        set_transaction_id(data.data.id);
        router.replace(`${url}/gallery/billing/plans/checkout/verification`);
      }
    }

    setLoading(false);
  }

  async function handleMigrateToPlan() {
    setMigrationLoading(true);

    const data: NextChargeParams = {
      value:
        interval === "monthly"
          ? +plan.pricing.monthly_price
          : +plan.pricing.annual_price,
      currency: "USD",
      type: plan.name,
      interval,
      id: plan._id as string,
    };

    const migrate = await updateSubscriptionPlan(
      data,
      user.gallery_id as string,
      typeof plan_action === "string" ? plan_action : "",
      csrf || ""
    );

    if (!migrate?.isOk)
      toast.error("Error notification", {
        description: migrate?.message,
        style: {
          background: "red",
          color: "white",
        },
        className: "class",
      });
    else
      toast.success("Operation successful", {
        description: "Migration successful",
        style: {
          background: "green",
          color: "white",
        },
        className: "class",
      });
    setMigrationLoading(false);
    router.replace("/gallery/billing");
  }

  return (
    <>
      <div className="flex justify-between items-center my-5">
        <h1 className="text-fluid-xs font-bold">Payment Method</h1>
        <p className="text-[13px] flex items-center gap-x-1 font-bold">
          <IoIosLock />
          <span className="text-[13px]">Secure form</span>
        </p>
      </div>
      <div className="rounded-[10px] ring-1 ring-[#e0e0e0] bg-no-repeat text-dark bg-blend-overlay p-5 relative w-full h-fit">
        <div className="w-full flex justify-start relative z-10 my-2">
          <p className="text-dark text-fluid-xs font-semibold">
            Billing card details
          </p>
        </div>
        {/* Icon */}
        <div className="flex justify-between items-center relative z-10">
          <div>
            <div className="flex space-x-3 items-center">
              <p className="text-fluid-xs text-dark font-bold dark whitespace-nowrap tracking-widest">
                {sub_data.card.first_6digits} ** ****{" "}
                {sub_data.card.last_4digits}
              </p>
            </div>
            <p className="text-normal text-fluid-xs font-normal text-dark ">
              {sub_data.card.expiry}
            </p>
          </div>

          <Image
            src={`/icons/${sub_data.card.type.toLowerCase()}.png`}
            alt={`${sub_data.card.type.toLowerCase()} logo`}
            height={20}
            width={40}
            className="w-fit h-fit"
          />
        </div>
        <div className="w-full flex justify-start mb-2 mt-5">
          <Link
            href={`/gallery/billing/card/?charge_type=card_change&redirect=/gallery/billing/plans/checkout/verification&plan_id=${plan.plan_id}&interval=${interval}`}
            className="w-full flex justify-start mt-5 mb-2"
          >
            <button className="h-[35px] p-5 rounded-full w-full flex items-center justify-center gap-3 disabled:cursor-not-allowed disabled:bg-dark/10 disabled:text-[#A1A1A1] bg-dark text-white text-fluid-xs font-normal">
              <span>Change card</span>
            </button>
          </Link>
        </div>
      </div>
      {error && (
        <p className="text-[13px] text-red-600 font-bold py-2">{error}</p>
      )}
      {!shouldCharge ? (
        <button
          disabled={migrationLoading}
          onClick={handleMigrateToPlan}
          className="h-[35px] p-5 mt-6 rounded-full w-full flex items-center justify-center gap-3 disabled:cursor-not-allowed disabled:bg-dark/10 disabled:text-[#A1A1A1] bg-dark text-white text-fluid-xs font-normal my-5"
        >
          {migrationLoading ? (
            <LoadSmall />
          ) : (
            <span className="flex items-center gap-x-2">
              <IoIosLock /> <span>Activate Plan</span>
            </span>
          )}
        </button>
      ) : (
        <button
          onClick={handlePayNow}
          disabled={loading}
          className="h-[35px] p-5 mt-6 rounded-full w-full flex items-center justify-center gap-3 disabled:cursor-not-allowed disabled:bg-dark/10 disabled:text-[#A1A1A1] bg-dark text-white text-fluid-xs font-normal"
        >
          {loading ? (
            <LoadSmall />
          ) : (
            <span className="flex items-center gap-x-2">
              <IoIosLock /> <span>Pay now</span>
            </span>
          )}
        </button>
      )}
    </>
  );
}
