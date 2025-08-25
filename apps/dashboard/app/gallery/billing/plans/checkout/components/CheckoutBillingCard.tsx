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
import { dashboard_url, getApiUrl } from "@omenai/url-config/src/config";
import { createTokenizedCharge } from "@omenai/shared-services/subscriptions/createTokenizedCharge";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";

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
  const queryClient = useQueryClient();
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

  const url = dashboard_url();

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

    await queryClient.invalidateQueries({
      queryKey: ["subscription_precheck"],
    });

    router.replace("/gallery/billing");
  }

  console.log(shouldCharge);

  return (
    <>
      <div className="mt-12 space-y-4">
        <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-semibold text-slate-900">Payment Details</h2>
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
              <IoIosLock className="w-3 h-3" />
              Encrypted
            </span>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-4 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-8 bg-slate-900 rounded flex items-center justify-center">
                  <span className="text-white text-xs font-bold">CARD</span>
                </div>
                <div>
                  <p className="font-mono text-sm font-medium text-slate-900">
                    •••• {sub_data.card.last_4digits}
                  </p>
                  <p className="text-xs text-slate-500">
                    {sub_data.card.expiry}
                  </p>
                </div>
              </div>
              <Image
                src={`/icons/${sub_data.card.type.toLowerCase()}.png`}
                alt={sub_data.card.type}
                height={24}
                width={36}
                className="h-6 w-auto"
              />
            </div>
          </div>

          <Link
            href={`/gallery/billing/card/?charge_type=card_change&redirect=/gallery/billing/plans/checkout/verification&plan_id=${plan.plan_id}&interval=${interval}`}
          >
            <button className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
              Use a different card →
            </button>
          </Link>
        </div>

        <button
          onClick={shouldCharge ? handlePayNow : handleMigrateToPlan}
          disabled={migrationLoading || loading || !shouldCharge}
          className="w-full py-3 bg-dark grid place-items-center text-white text-fluid-xs font-medium rounded-xl disabled:bg-dark/30 disabled:cursor-not-allowed hover:bg-dark/90 transition-colors"
        >
          {loading || migrationLoading ? <LoadSmall /> : "Confirm Payment"}
        </button>
      </div>
    </>
  );
}
