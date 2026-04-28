"use client";
import React, { useState } from "react";
import { IoIosLock } from "react-icons/io";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { updateSubscriptionPlan } from "@omenai/shared-services/subscriptions/updateSubscriptionPlan";
import {
  SubscriptionPlanDataTypes,
  SubscriptionModelSchemaTypes,
  NextChargeParams,
} from "@omenai/shared-types";
import { LoadSmall } from "@omenai/shared-ui-components/components/loader/Load";
import { dashboard_url, getApiUrl } from "@omenai/url-config/src/config";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";
import { createStripeTokenizedCharge } from "@omenai/shared-services/subscriptions/stripe/createStripeTokenizedCharge";
import { toast_notif } from "@omenai/shared-utils/src/toast_notification";
import { loadStripe, Stripe } from "@stripe/stripe-js";
import BillingCard from "../../../features/components/BillingCard";
import { PaymentMethod } from "@stripe/stripe-js";
import { BUTTON_CLASS } from "@omenai/shared-ui-components/components/styles/inputClasses";

const stripe = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PK!);

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
    created?: string;
    updatedAt?: string;
  };
  interval: string;
  amount: number;
  shouldCharge: boolean;
}) {
  const queryClient = useQueryClient();
  const { user } = useAuth({ requiredRole: "gallery" });

  const [error, setError] = useState<string>("");
  const searchParams = useSearchParams();
  const plan_action = searchParams.get("plan_action");
  const { csrf } = useAuth({ requiredRole: "gallery" });
  const [loading, setLoading] = useState<boolean>(false);
  const [migrationLoading, setMigrationLoading] = useState<boolean>(false);

  if (!stripe)
    toast_notif(
      "Stripe not loaded yet. Please refresh or contact support if issue persists",
      "error",
    );

  const router = useRouter();

  async function handlePayNow() {
    setError("");
    setLoading(true);

    const tokenize_card = await createStripeTokenizedCharge(
      amount,
      user.gallery_id,
      {
        name: user.name,
        email: user.email,
        gallery_id: user.gallery_id,
        plan_id: plan.plan_id,
        plan_interval: interval,
      },
      csrf || "",
    );

    if (tokenize_card?.requiresAction) {
      toast_notif("Additional authentication required by your bank.", "info");
      const stripePromise = await stripe;

      if (!stripePromise) {
        toast_notif("Stripe failed to load.", "error");
        setLoading(false);
        return;
      }

      // Prompt the user with the 3D Secure modal
      const { error, paymentIntent } = await stripePromise.confirmCardPayment(
        tokenize_card.client_secret,
      );

      if (error) {
        // The user failed or canceled the 3D Secure challenge
        toast_notif(error.message || "Payment authentication failed.", "error");
        setLoading(false);
        return;
      }

      if (paymentIntent && paymentIntent.status === "succeeded") {
        // 3D Secure passed and payment succeeded
        router.push(
          `${dashboard_url()}/gallery/billing/plans/checkout/verification?payment_intent=${paymentIntent.id}`,
        );
      }
      setLoading(false);
      return;
    }

    // 2. Handle Standard Errors (Card declines, insufficient funds, etc.)
    if (!tokenize_card?.isOk) {
      toast_notif(
        tokenize_card?.message ||
          "Unable to process payment. Please check your card.",
        "error",
      );
      setLoading(false);
      return;
    }

    // 3. Handle Standard Success (Payment went through without 3D Secure)
    toast_notif("Payment successful! Redirecting...", "success");
    router.push(
      `${dashboard_url()}/gallery/billing/plans/checkout/verification?payment_intent=${tokenize_card.paymentIntentId}`,
    );

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
      csrf || "",
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

  return (
    <>
      <div className=" space-y-4 mb-4 w-full">
        <div className="bg-gradient-to-br from-slate-50 to-white rounded-sm  p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-semibold text-slate-900">Payment Details</h2>
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-sm ">
              <IoIosLock className="w-3 h-3" />
              Encrypted
            </span>
          </div>
          <BillingCard
            paymentMethod={sub_data.paymentMethod as PaymentMethod}
            plan_id={plan.plan_id}
            plan_interval={interval}
          />
        </div>

        <button
          onClick={shouldCharge ? handlePayNow : handleMigrateToPlan}
          disabled={migrationLoading || loading}
          className={BUTTON_CLASS}
        >
          {loading || migrationLoading ? (
            <LoadSmall />
          ) : shouldCharge ? (
            "Confirm Payment"
          ) : (
            "Migrate to this plan"
          )}
        </button>
      </div>
    </>
  );
}
