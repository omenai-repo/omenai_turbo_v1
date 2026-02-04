"use client";
import { useState, useEffect } from "react";
import { Check, X, ArrowLeft, Loader2, Lock } from "lucide-react";
import { notFound, useSearchParams } from "next/navigation";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import PageTitle from "../../../../components/PageTitle";
import { verifySubscriptionCharge } from "@omenai/shared-services/subscriptions/stripe/verifySubscriptionCharge";
import { verifyDiscountedSubscriptionCharge } from "@omenai/shared-services/subscriptions/stripe/verifyDiscountedSubscription";
import Link from "next/link";

/* -------------------------------------------------------------------------- */
/* UI COMPONENTS                              */
/* -------------------------------------------------------------------------- */

const LoadingState = () => (
  <div className="w-full max-w-sm bg-white rounded-lg border border-slate-100 shadow-xl shadow-slate-200/50 p-10 text-center">
    <div className="flex justify-center mb-6">
      <div className="relative">
        <div className="absolute inset-0 bg-emerald-100 rounded-full blur-xl opacity-50"></div>
        <Loader2 className="relative w-12 h-12 text-emerald-600 animate-spin" />
      </div>
    </div>
    <h2 className="text-lg font-semibold text-slate-900 mb-2">
      Verifying Transaction
    </h2>
    <p className="text-sm text-slate-500">
      Please wait while we confirm your payment details securely.
    </p>
  </div>
);

const SuccessState = ({
  message,
  showContent,
}: {
  message: string;
  showContent: boolean;
}) => (
  <div
    className={`w-full max-w-sm bg-white rounded-lg border border-slate-100 shadow-xl shadow-slate-200/50 p-8 text-center transition-all duration-700 ${
      showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
    }`}
  >
    <div className="flex justify-center mb-6">
      <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center">
        <Check className="w-8 h-8 text-emerald-600" strokeWidth={3} />
      </div>
    </div>
    <h2 className="text-xl font-bold text-slate-900 mb-2">Payment Verified</h2>
    <p className="text-sm text-slate-500 mb-8 leading-relaxed">{message}</p>

    <Link
      href="/gallery/billing"
      className="block w-full rounded-md bg-slate-900 py-3 text-sm font-medium text-white hover:bg-slate-800 transition focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
    >
      View Subscription
    </Link>

    <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
      <Lock className="w-3 h-3" />
      <span>Secure SSL Encrypted</span>
    </div>
  </div>
);

const ErrorState = ({
  message,
  showContent,
}: {
  message: string;
  showContent: boolean;
}) => (
  <div
    className={`w-full max-w-sm bg-white rounded-lg border border-red-100 shadow-xl shadow-red-100/50 p-8 text-center transition-all duration-700 ${
      showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
    }`}
  >
    <div className="flex justify-center mb-6">
      <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
        <X className="w-8 h-8 text-red-600" strokeWidth={3} />
      </div>
    </div>
    <h2 className="text-xl font-bold text-slate-900 mb-2">
      Verification Failed
    </h2>
    <p className="text-sm text-slate-500 mb-8 leading-relaxed">{message}</p>

    <Link
      href="/gallery/billing"
      className="group flex items-center justify-center gap-2 w-full rounded-md border border-slate-200 bg-white py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition focus:outline-none focus:ring-2 focus:ring-slate-200 focus:ring-offset-2"
    >
      <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
      Return to Billing
    </Link>
  </div>
);

/* -------------------------------------------------------------------------- */
/* LOGIC                                   */
/* -------------------------------------------------------------------------- */

// Helper function (Logic Unchanged)
const processVerificationResponse = (response: any) => {
  return {
    message: response?.message || "Unknown error occurred",
    isOk: response?.isOk ?? false,
  };
};

async function handleVerificationApiCall({
  isDiscounted,
  payload,
}: {
  isDiscounted: boolean;
  payload: {
    galleryId: string;
    planId: string;
    paymentIntentId: string;
    token: string;
  };
}) {
  if (isDiscounted) {
    return await verifyDiscountedSubscriptionCharge(
      payload.paymentIntentId,
      payload.planId,
      payload.galleryId,
      payload.token,
    );
  } else {
    return await verifySubscriptionCharge(
      payload.paymentIntentId,
      payload.token,
    );
  }
}

export default function TransactionVerification() {
  const searchParams = useSearchParams();
  const paymentIntentId = searchParams.get("payment_intent");
  const setupIntentId = searchParams.get("setup_intent");
  const isDiscounted = searchParams.get("isDiscounted");
  const [showContent, setShowContent] = useState(false);
  const planId = searchParams.get("planId") as string;

  if (isDiscounted === "false" && !paymentIntentId) return notFound();
  if (isDiscounted === "true" && !planId && !setupIntentId) return notFound();

  const { csrf, user } = useAuth({ requiredRole: "gallery" });

  const { data: verified, isLoading } = useQuery({
    queryKey: ["verify_subscription_payment_on_redirect"],
    queryFn: async () => {
      const response = await handleVerificationApiCall({
        isDiscounted: isDiscounted === "true",
        payload: {
          planId,
          galleryId: user.gallery_id,
          token: csrf || "",
          paymentIntentId: isDiscounted
            ? (setupIntentId as string)
            : (paymentIntentId as string),
        },
      });
      return processVerificationResponse(response);
    },
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => setShowContent(true), 100);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  return (
    <>
      <PageTitle title="Verifying Transaction" />
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 bg-slate-50/50">
        {isLoading ? (
          <LoadingState />
        ) : verified?.isOk ? (
          <SuccessState
            message={verified?.message || "Success"}
            showContent={showContent}
          />
        ) : (
          <ErrorState
            message={verified?.message || "An error occurred"}
            showContent={showContent}
          />
        )}
      </div>
    </>
  );
}
