"use client";

import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { verifyFlwTransaction } from "@omenai/shared-services/subscriptions/verifyFlwTransaction";
import Load from "@omenai/shared-ui-components/components/loader/Load";
import { QueryClient, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Loader,
  LockKeyhole,
  XCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { IoIosLock } from "react-icons/io";

export default function VerifyTransaction({
  transaction_id,
}: {
  transaction_id: string;
}) {
  const queryClient = useQueryClient();
  const { csrf } = useAuth({ requiredRole: "gallery" });
  const { data: verified, isLoading } = useQuery({
    queryKey: ["verify_subscription_payment"],
    queryFn: async () => {
      const response = await verifyFlwTransaction(transaction_id, csrf || "");
      if (!response?.isOk) {
        return {
          message: `${response?.message}. Please contact support`,
          isOk: response?.isOk,
        };
        throw new Error("Something went wrong");
      } else {
        return {
          message: response.message,
          data: response.data,
          isOk: response.isOk,
        };
      }
    },
    refetchOnWindowFocus: false,
  });
  return (
    <div className="max-w-lg mx-auto p-6">
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h1 className="text-xl font-bold text-gray-900">
            Transaction Verification
          </h1>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full">
            <LockKeyhole size={20} strokeWidth={1.5} absoluteStrokeWidth />
            <span className="text-sm font-medium text-green-700">
              Secure form
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="mb-6">
                <Load />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  Verifying Transaction
                </h3>
                <p className="text-sm text-gray-600">
                  Please wait while we verify your payment...
                </p>
              </div>

              {/* Progress indicator */}
              <div className="w-full max-w-xs mt-6">
                <div className="bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gray-900 h-full rounded-full animate-pulse"
                    style={{ width: "70%" }}
                  ></div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8">
              {/* Status Icon */}
              <div className="mb-6">
                {verified?.isOk ? (
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                ) : (
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                    <XCircle className="w-8 h-8 text-red-600" />
                  </div>
                )}
              </div>

              {/* Status Message */}
              <div className="text-center mb-8">
                <h3
                  className={`text-lg font-semibold mb-2 ${
                    verified?.isOk ? "text-green-900" : "text-red-900"
                  }`}
                >
                  {verified?.isOk
                    ? "Verification Successful"
                    : "Verification Failed"}
                </h3>
                <p className="text-sm text-gray-600 max-w-sm">
                  {verified?.message}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 w-full max-w-sm">
                {verified?.isOk ? (
                  <button className="flex-1 h-12 bg-gray-900 text-white text-sm font-semibold rounded-xl transition-all duration-200 hover:bg-gray-800 focus:ring-4 focus:ring-gray-100 flex items-center justify-center gap-2">
                    View Subscription Info
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <div className="flex gap-3 w-full">
                    <button className="flex-1 h-12 bg-gray-100 text-gray-700 text-sm font-medium rounded-xl transition-all duration-200 hover:bg-gray-200 focus:ring-4 focus:ring-gray-100 flex items-center justify-center gap-2">
                      <ArrowLeft className="w-4 h-4" />
                      Go Back
                    </button>
                    <button
                      // onClick={handleRetry}
                      className="flex-1 h-12 bg-gray-900 text-white text-sm font-semibold rounded-xl transition-all duration-200 hover:bg-gray-800 focus:ring-4 focus:ring-gray-100 flex items-center justify-center gap-2"
                    >
                      <Loader className="w-4 h-4" />
                      Retry
                    </button>
                  </div>
                )}
              </div>

              {/* Additional Info */}
              {verified?.isOk && (
                <div className="mt-6 p-4 bg-green-50 border border-green-100 rounded-xl w-full max-w-sm">
                  <div className="flex items-center gap-2 text-sm text-green-800">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="font-medium">
                      Payment method updated successfully
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
