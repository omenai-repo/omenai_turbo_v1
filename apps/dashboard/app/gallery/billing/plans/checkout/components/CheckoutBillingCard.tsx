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

const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PK!);

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
      "error"
    );

  const router = useRouter();

  const handlePaymentResponse = async (
    stripe: Stripe,
    data: { status: string; client_secret: string; paymentIntentId: string }
  ) => {
    const { status, client_secret, paymentIntentId } = data;

    switch (status) {
      case "succeeded":
        // ✅ Payment complete
        router.push(
          `${dashboard_url()}/gallery/billing/plans/checkout/verification?payment_intent=${paymentIntentId}`
        );
        break;

      case "requires_action":
        // ⚠️ Needs customer authentication (3DS)
        await stripe.confirmCardPayment(client_secret);
        router.push(
          `${dashboard_url()}/gallery/billing/plans/checkout/verification?payment_intent=${paymentIntentId}`
        );
        break;

      case "requires_payment_method":
        router.push(
          `${dashboard_url()}/gallery/billing/plans/checkout/verification?payment_intent=${paymentIntentId}`
        );
        break;

      case "processing":
        // ⏳ Still pending

        router.push(
          `${dashboard_url()}/gallery/billing/plans/checkout/verification?payment_intent=${paymentIntentId}`
        );
        break;

      case "canceled":
        alert("Payment was canceled.");
        router.push(`${dashboard_url()}/gallery/billing/plans`);
        break;

      default:
        alert(`Unhandled payment status: ${status}`);
        router.push(`${dashboard_url()}/gallery/billing/plans`);
        break;
    }
  };

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
      csrf || ""
    );

    if (!tokenize_card?.isOk)
      toast_notif(
        "Unable to initiate card charge. Please contact support",
        "error"
      );
    else {
      const { client_secret, status, paymentIntentId } = tokenize_card;

      await handlePaymentResponse(stripe as Stripe, {
        status,
        client_secret,
        paymentIntentId,
      });

      toast_notif("Please wait... processing", "info");
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
          <BillingCard
            paymentMethod={sub_data.paymentMethod as PaymentMethod}
            plan_id={plan.plan_id}
            plan_interval={interval}
          />
        </div>

        <button
          onClick={shouldCharge ? handlePayNow : handleMigrateToPlan}
          disabled={migrationLoading || loading}
          className="w-full py-3 bg-dark grid place-items-center text-white text-fluid-xs font-medium rounded-xl disabled:bg-dark/30 disabled:cursor-not-allowed hover:bg-dark/90 transition-colors"
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
