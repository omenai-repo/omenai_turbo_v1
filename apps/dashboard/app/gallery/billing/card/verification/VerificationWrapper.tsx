"use client";
import React, { useState, useEffect } from "react";
import {
  CheckCircle,
  CreditCard,
  ArrowLeft,
  Shield,
  Zap,
  Star,
  XCircle,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { notFound, useSearchParams } from "next/navigation";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { updatePaymentMethod } from "@omenai/shared-services/subscriptions/stripe/updatePaymentMethod";
import { useQuery } from "@tanstack/react-query";

export const PaymentMethodSuccessScreen = ({ isVisible = true }) => {
  const [showContent, setShowContent] = useState(false);
  const [animateIcon, setAnimateIcon] = useState(false);

  const searchParams = useSearchParams();
  const setupIntentId = searchParams.get("setup_intent");

  if (setupIntentId === null || setupIntentId === undefined) notFound();

  const { csrf, user } = useAuth({ requiredRole: "gallery" });

  const { data: verified, isLoading } = useQuery({
    queryKey: ["verify_payment_method_update"],
    queryFn: async () => {
      const response = await updatePaymentMethod(
        setupIntentId,
        user.gallery_id,
        csrf || ""
      );
      if (!response?.isOk) {
        return {
          message: `${response?.message}. Please contact support`,
          isOk: response?.isOk,
        };
      } else {
        return {
          message: response.message,
          isOk: response.isOk,
        };
      }
    },
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (isVisible && !isLoading) {
      // Trigger animations with delays
      setTimeout(() => setAnimateIcon(true), 300);
      setTimeout(() => setShowContent(true), 600);
    }
  }, [isVisible, isLoading]);

  if (!isVisible || isLoading) return null;

  const isSuccess = verified?.isOk;
  const message = verified?.message || "";

  // Success Screen Component
  const SuccessScreen = () => (
    <div className="bg-white rounded shadow-2xl max-w-md w-full mx-auto overflow-hidden">
      {/* Header with gradient */}
      <div className="bg-gradient-to-br from-green-500 to-emerald-600 px-8 pt-12 pb-8 text-white relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-32 h-32 rounded-full bg-white transform -translate-x-16 -translate-y-16"></div>
          <div className="absolute bottom-0 right-0 w-24 h-24 rounded-full bg-white transform translate-x-12 translate-y-12"></div>
          <div className="absolute top-1/2 left-1/2 w-16 h-16 rounded-full bg-white transform -translate-x-8 -translate-y-8"></div>
        </div>

        {/* Success check animation */}
        <div className="relative z-10 flex flex-col items-center">
          <div
            className={`relative mb-6 transform transition-all duration-700 ${
              animateIcon ? "scale-100 rotate-0" : "scale-0 rotate-180"
            }`}
          >
            <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <CheckCircle
                size={48}
                className={`text-white transform transition-all duration-500 ${
                  animateIcon ? "scale-100" : "scale-0"
                }`}
                fill="currentColor"
              />
            </div>
            {/* Pulse rings */}
            <div
              className={`absolute inset-0 rounded-full border-2 border-white opacity-30 transform transition-all duration-1000 ${
                animateIcon ? "scale-150 opacity-0" : "scale-100 opacity-30"
              }`}
            ></div>
            <div
              className={`absolute inset-0 rounded-full border-2 border-white opacity-20 transform transition-all duration-1000 delay-200 ${
                animateIcon ? "scale-200 opacity-0" : "scale-100 opacity-20"
              }`}
            ></div>
          </div>

          <div
            className={`text-center transform transition-all duration-700 delay-300 ${
              showContent
                ? "translate-y-0 opacity-100"
                : "translate-y-4 opacity-0"
            }`}
          >
            <h2 className="text-fluid-sm font-semibold mb-2">
              Payment Method Added!
            </h2>
            <p className="text-white text-opacity-90 text-fluid-xs">
              Successfully saved to your account
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div
        className={`px-8 py-8 transform transition-all duration-700 delay-500 ${
          showContent ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        }`}
      >
        {/* Generic payment confirmation */}
        <div className="flex items-center justify-between mb-8 p-4 bg-gray-50 rounded">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded flex items-center justify-center text-white shadow-lg">
              <CreditCard size={24} />
            </div>
            <div>
              <p className="font-medium text-fluid-xs text-gray-900">
                New Payment Method
              </p>
              <p className="text-gray-600 text-fluid-xs">
                Ready for secure transactions
              </p>
            </div>
          </div>
          <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
            <Star size={12} fill="currentColor" />
            Active
          </div>
        </div>

        {/* Benefits */}
        <div className="space-y-4 mb-8">
          <div className="flex items-center gap-3 text-fluid-xs text-gray-700">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <Shield size={16} className="text-green-600" />
            </div>
            <span className="text-sm">Secured with bank-level encryption</span>
          </div>
          <div className="flex items-center gap-3 text-gray-700">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Zap size={16} className="text-blue-600" />
            </div>
            <span className="text-sm">Ready for instant payments</span>
          </div>
          <div className="flex items-center gap-3 text-gray-700">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <CreditCard size={16} className="text-purple-600" />
            </div>
            <span className="text-sm">Available across all subscriptions</span>
          </div>
        </div>

        {/* CTA Button */}
        <Link href={"/gallery/billing"}>
          <button className="w-full bg-gradient-to-r text-fluid-xs from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 hover:shadow-lg text-white font-semibold py-4 px-6 rounded transform transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center gap-2">
            <ArrowLeft size={18} />
            Back to billing page
          </button>
        </Link>
      </div>
    </div>
  );

  // Error Screen Component
  const ErrorScreen = () => (
    <div className="bg-white rounded shadow-2xl max-w-md w-full mx-auto overflow-hidden">
      {/* Header with gradient */}
      <div className="bg-gradient-to-br from-red-500 to-red-600 px-8 pt-12 pb-8 text-white relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-32 h-32 rounded-full bg-white transform -translate-x-16 -translate-y-16"></div>
          <div className="absolute bottom-0 right-0 w-24 h-24 rounded-full bg-white transform translate-x-12 translate-y-12"></div>
          <div className="absolute top-1/2 left-1/2 w-16 h-16 rounded-full bg-white transform -translate-x-8 -translate-y-8"></div>
        </div>

        {/* Error icon animation */}
        <div className="relative z-10 flex flex-col items-center">
          <div
            className={`relative mb-6 transform transition-all duration-700 ${
              animateIcon ? "scale-100 rotate-0" : "scale-0 rotate-180"
            }`}
          >
            <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <XCircle
                size={48}
                className={`text-white transform transition-all duration-500 ${
                  animateIcon ? "scale-100" : "scale-0"
                }`}
                fill="currentColor"
              />
            </div>
            {/* Pulse rings */}
            <div
              className={`absolute inset-0 rounded-full border-2 border-white opacity-30 transform transition-all duration-1000 ${
                animateIcon ? "scale-150 opacity-0" : "scale-100 opacity-30"
              }`}
            ></div>
            <div
              className={`absolute inset-0 rounded-full border-2 border-white opacity-20 transform transition-all duration-1000 delay-200 ${
                animateIcon ? "scale-200 opacity-0" : "scale-100 opacity-20"
              }`}
            ></div>
          </div>

          <div
            className={`text-center transform transition-all duration-700 delay-300 ${
              showContent
                ? "translate-y-0 opacity-100"
                : "translate-y-4 opacity-0"
            }`}
          >
            <h2 className="text-fluid-sm font-semibold mb-2">
              Payment Method Failed
            </h2>
            <p className="text-white text-opacity-90 text-fluid-xs">
              Unable to save payment method
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div
        className={`px-8 py-8 transform transition-all duration-700 delay-500 ${
          showContent ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        }`}
      >
        {/* Error message */}
        <div className="flex items-start gap-4 mb-8 p-4 bg-red-50 rounded border border-red-100">
          <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded flex items-center justify-center text-white shadow-lg flex-shrink-0">
            <AlertTriangle size={24} />
          </div>
          <div className="flex-1">
            <p className="font-medium text-fluid-xs text-gray-900 mb-1">
              Error Details
            </p>
            <p className="text-red-600 text-fluid-xs leading-relaxed">
              {message ||
                "Something went wrong while adding your payment method"}
            </p>
          </div>
        </div>

        {/* Troubleshooting steps */}
        <div className="space-y-4 mb-8">
          <div className="flex items-center gap-3 text-gray-700">
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
              <RefreshCw size={16} className="text-orange-600" />
            </div>
            <span className="text-sm">Try refreshing this page again</span>
          </div>
          <div className="flex items-center gap-3 text-gray-700">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <CreditCard size={16} className="text-blue-600" />
            </div>
            <span className="text-sm">Verify your payment details</span>
          </div>
          <div className="flex items-center gap-3 text-gray-700">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <Shield size={16} className="text-purple-600" />
            </div>
            <span className="text-sm">Contact support if issue persists</span>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="space-y-3 flex flex-col">
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-gradient-to-r text-fluid-xs from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 hover:shadow-lg text-white font-semibold py-4 px-6 rounded transform transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
          >
            <RefreshCw size={18} />
            Try Again
          </button>
          <Link href={"/gallery/billing"}>
            <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-4 px-6 rounded transform transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center gap-2">
              <ArrowLeft size={18} />
              Back to billing page
            </button>
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      {isSuccess ? <SuccessScreen /> : <ErrorScreen />}
    </div>
  );
};

// Simple demo component
const PaymentSuccessDemo = () => {
  const [showSuccess, setShowSuccess] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Payment Method Success/Error Screen
          </h1>
          <p className="text-gray-600 mb-6">
            Dynamic confirmation screen based on payment status
          </p>

          {!showSuccess && (
            <button
              onClick={() => setShowSuccess(true)}
              className="bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-3 rounded transition-colors"
            >
              Show Success Screen
            </button>
          )}
        </div>

        {!showSuccess && (
          <div className="text-center py-16">
            <div className="bg-white rounded p-8 shadow-lg max-w-md mx-auto">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Success screen closed
              </h3>
              <p className="text-gray-600 mb-4">
                User returned to billing page
              </p>
              <button
                onClick={() => setShowSuccess(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded"
              >
                Show Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccessDemo;
