"use client";
import { handleError } from "@omenai/shared-utils/src/handleQueryError";
import { dashboard_url, getApiUrl } from "@omenai/url-config/src/config";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

import Link from "next/link";
import { CheckCircle, XCircle, CreditCard, ArrowLeft, Eye, Clock4 } from "lucide-react";

const LoadIcon = () => (
  <div className="relative">
    <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-pulse"></div>
    <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-blue-500 rounded-full animate-spin"></div>
    <div
      className="absolute inset-2 w-12 h-12 border-4 border-transparent border-t-purple-400 rounded-full animate-spin"
      style={{ animationDirection: "reverse", animationDuration: "1.5s" }}
    ></div>
    <CreditCard className="absolute inset-0 m-auto w-6 h-6 text-blue-600 animate-pulse" />
  </div>
);

export default function VerifyTransactionWrapper() {
  const searchParams = useSearchParams();
  const transaction_id = searchParams.get("transaction_id");
  const [showContent, setShowContent] = useState(false);

  const url = getApiUrl();

  const { data: verified, isLoading } = useQuery({
    queryKey: ["verify_transaction"],
    queryFn: async () => {
      try {
        const response = await fetch(
          `${url}/api/transactions/verify_FLW_transaction`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" }, // Add appropriate header
            body: JSON.stringify({ transaction_id }),
          }
        );
        const result = await response.json();

        return { message: result.message, isOk: response.ok, status: result.status, success: result.success };
      } catch (error) {
        console.error("Error verifying transaction:", error);
        handleError();
      }
    },
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => setShowContent(true), 200);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  return (
    <>
      <div className="relative h-[80vh] grid place-items-center p-4">
        <div className="w-full max-w-md">
          {isLoading ? (
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 transform transition-all duration-700 hover:scale-105">
              <div className="flex flex-col items-center justify-center space-y-8">
                <LoadIcon />

                <div className="text-center space-y-3">
                  <h2 className="text-fluid-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Verifying Transaction
                  </h2>
                  <p className="text-gray-600 text-fluid-xs animate-pulse">
                    Please wait while we confirm your payment...
                  </p>
                </div>

                {/* Progress dots */}
                <div className="flex space-x-2">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"
                      style={{ animationDelay: `${i * 0.2}s` }}
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div
              className={`bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 transform transition-all duration-1000 ${showContent ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}
            >
              <div className="flex flex-col items-center space-y-8">
                {/* Success/Error Icon with Animation */}
                <div className="relative">
                  <div
                    className={`w-20 h-20 rounded-full flex items-center justify-center transform transition-all duration-500 ${showContent ? "scale-100 rotate-0" : "scale-0 rotate-180"} ${verified?.isOk && verified.status === 'successful' ? "bg-green-100 text-green-600" : verified?.isOk && verified.status === 'processing'?"bg-amber-100 text-amber-600": "bg-red-100 text-red-600"}`}
                  >
                    {verified?.status === 'successful' ? (
                      <CheckCircle className="w-12 h-12 animate-pulse" />
                    ) : verified?.status === 'processing'? 
                    <Clock4 className="w-12 h-12 animate-pulse" />:
                      <XCircle className="w-12 h-12 animate-pulse" />  
                    }
                  </div>

                  {/* Ripple effect */}
                  {verified?.isOk && (
                    <div className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-20"></div>
                  )}
                </div>

                {/* Message */}
                <div className="text-center space-y-4 max-w-sm">
                  <h2
                    className={`text-fluid-md font-semibold transition-colors duration-500 ${verified?.isOk && verified.status === 'successful' ? "text-green-700" : verified?.isOk && verified.status === 'processing'? "text-amber-700": "text-red-700"}`}
                  >
                    {verified?.success
                      ? "Payment Verified!"
                      : "Payment Verification Failed"}
                  </h2>

                  <p className="text-gray-600 text-fluid-xs leading-relaxed">
                    {verified?.message}
                  </p>
                </div>

                {/* Action Button */}
                <div className="w-full pt-4 flex flex-col space-y-3">
                  <Link
                    href={`${dashboard_url()}/user/orders`}
                    className={`group relative overflow-hidden h-12 px-4 rounded w-full flex items-center justify-center gap-3 font-medium text-white transition-all duration-300 transform hover:scale-101 text-fluid-xs hover:shadow-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700`}
                  >
                    {/* Button shine effect */}
                    <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>

                    <>
                      <Eye className="w-5 h-5 transition-transform group-hover:scale-110" />
                      <span>Return to dashboard</span>
                    </>
                  </Link>
                  <Link
                    href={`/`}
                    className={`group relative overflow-hidden h-12 px-4 rounded w-full flex items-center justify-center gap-3 font-medium text-white transition-all duration-300 transform hover:scale-101 text-fluid-xs hover:shadow-xl bg-dark hover:bg-dark/80`}
                  >
                    {/* Button shine effect */}
                    <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>

                    <>
                      <Eye className="w-5 h-5 transition-transform group-hover:scale-110" />
                      <span>Go to home page</span>
                    </>
                  </Link>
                </div>

                {/* Security badge */}
                <div className="flex items-center gap-2 text-fluid-xs text-gray-500 pt-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span>Secure SSL Encrypted Transaction</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
