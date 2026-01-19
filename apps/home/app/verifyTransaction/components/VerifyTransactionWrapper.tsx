"use client";

import { dashboard_url, getApiUrl } from "@omenai/url-config/src/config";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  CheckCircle,
  XCircle,
  CreditCard,
  ArrowLeft,
  Eye,
  Clock4,
} from "lucide-react";
import { useRollbar } from "@rollbar/react";
import type Rollbar from "rollbar";

// Status configuration
const STATUS_CONFIG = {
  successful: {
    bgColor: "bg-green-100",
    textColor: "text-green-600",
    titleColor: "text-green-700",
    rippleColor: "bg-green-400",
    icon: CheckCircle,
  },
  failed: {
    bgColor: "bg-red-100",
    textColor: "text-red-600",
    titleColor: "text-red-700",
    rippleColor: "bg-red-400",
    icon: XCircle,
  },
};

// Sub-components
const LoadIcon = () => (
  <div className="relative">
    <div className="w-16 h-16 border-4 border-blue-200 rounded animate-pulse"></div>
    <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-blue-500 rounded animate-spin"></div>
    <div
      className="absolute inset-2 w-12 h-12 border-4 border-transparent border-t-purple-400 rounded animate-spin"
      style={{ animationDirection: "reverse", animationDuration: "1.5s" }}
    ></div>
    <CreditCard className="absolute inset-0 m-auto w-6 h-6 text-blue-600 animate-pulse" />
  </div>
);

const ProgressDots = () => (
  <div className="flex space-x-2">
    {[0, 1, 2].map((i) => (
      <div
        key={i}
        className="w-2 h-2 bg-blue-400 rounded animate-pulse"
        style={{ animationDelay: `${i * 0.2}s` }}
      />
    ))}
  </div>
);

const LoadingState = () => (
  <div className="bg-white/80 backdrop-blur-xl rounded p-8 shadow-2xl border border-white/20 transform transition-all duration-700 hover:scale-105">
    <div className="flex flex-col items-center justify-center space-y-8">
      <LoadIcon />
      <div className="text-center space-y-3">
        <h2 className="text-fluid-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Verifying Transaction
        </h2>
        <p className="text-gray-600 text-fluid-xxs animate-pulse">
          Please wait while we confirm your payment...
        </p>
      </div>
      <ProgressDots />
    </div>
  </div>
);

const ErrorState = () => (
  <div className="bg-white/80 backdrop-blur-xl rounded p-8 shadow-2xl border border-white/20 transform transition-all duration-700 hover:scale-105">
    <div className="flex flex-col items-center justify-center space-y-8">
      <h2 className="text-fluid-base font-semibold bg-gradient-to-r from-red-600 to-red-600 bg-clip-text text-transparent">
        Error occurred while verifying transaction
      </h2>
      <p className="text-gray-700 text-fluid-xxs animate-pulse">
        Don't worry, it's on us. Please reload your page or contact support.
      </p>
    </div>
  </div>
);

const StatusIcon = ({
  status,
  showContent,
}: {
  status: keyof typeof STATUS_CONFIG;
  showContent: boolean;
}) => {
  const config = STATUS_CONFIG[status];
  const IconComponent = config.icon;

  return (
    <div className="relative">
      <div
        className={`w-20 h-20 rounded flex items-center justify-center transform transition-all duration-500 ${
          showContent ? "scale-100 rotate-0" : "scale-0 rotate-180"
        } ${config.bgColor} ${config.textColor}`}
      >
        <IconComponent className="w-12 h-12 animate-pulse" />
      </div>
      <div
        className={`absolute inset-0 rounded animate-ping opacity-20 ${config.rippleColor}`}
      />
    </div>
  );
};

const ActionButtons = () => (
  <div className="w-full pt-4 flex flex-col space-y-3">
    <Link
      href={`${dashboard_url()}/user/orders`}
      className="group relative overflow-hidden h-12 px-4 rounded w-full flex items-center justify-center gap-3 font-medium text-white transition-all duration-300 transform hover:scale-101 text-fluid-xxs hover:shadow-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
    >
      <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
      <Eye className="w-5 h-5 transition-transform group-hover:scale-110" />
      <span>Return to dashboard</span>
    </Link>
    <Link
      href="/"
      className="group relative overflow-hidden h-12 px-4 rounded w-full flex items-center justify-center gap-3 font-medium text-white transition-all duration-300 transform hover:scale-101 text-fluid-xxs hover:shadow-xl bg-dark hover:bg-dark/80"
    >
      <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
      <ArrowLeft className="w-5 h-5 transition-transform group-hover:scale-110" />
      <span>Go to home page</span>
    </Link>
  </div>
);

const SecurityBadge = () => (
  <div className="flex items-center gap-2 text-fluid-xxs text-slate-700 pt-2">
    <div className="w-2 h-2 bg-green-400 rounded animate-pulse" />
    <span>Secure SSL Encrypted Transaction</span>
  </div>
);

const SuccessState = ({
  verified,
  showContent,
}: {
  verified: {
    status: keyof typeof STATUS_CONFIG;
    success: boolean;
    message: string;
  };
  showContent: boolean;
}) => {
  const config = STATUS_CONFIG[verified.status];

  return (
    <div
      className={`bg-white/90 backdrop-blur-xl rounded p-8 shadow-2xl border border-white/20 transform transition-all duration-1000 ${
        showContent ? "scale-100 opacity-100" : "scale-95 opacity-0"
      }`}
    >
      <div className="flex flex-col items-center space-y-8">
        <StatusIcon status={verified.status} showContent={showContent} />

        <div className="text-center space-y-4 max-w-sm">
          <h2
            className={`text-fluid-md font-semibold transition-colors duration-500 ${config.titleColor}`}
          >
            Payment verification completed
          </h2>
          <p className="text-gray-600 text-fluid-xxs leading-relaxed">
            {verified.message}
          </p>
        </div>

        <ActionButtons />
        <SecurityBadge />
      </div>
    </div>
  );
};

// Helper function
const verifyTransaction = async (
  transactionId: string,
  apiUrl: string,
  rollbar: Rollbar
) => {
  try {
    const response = await fetch(
      `${apiUrl}/api/transactions/verify_FLW_transaction`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transaction_id: transactionId }),
      }
    );

    if (!response.ok) {
      return { isOk: false };
    }

    const result = await response.json();
    return {
      message: result.message,
      isOk: response.ok,
      status: result.status,
      success: result.success,
    };
  } catch (error) {
    if (error instanceof Error) {
      rollbar.error(error);
    } else {
      rollbar.error(new Error(String(error)));
    }
    console.error("Error verifying transaction:", error);
    return { isOk: false };
  }
};

export default function VerifyTransactionWrapper() {
  const searchParams = useSearchParams();
  const rollbar = useRollbar();
  const transaction_id = searchParams.get("transaction_id");
  const [showContent, setShowContent] = useState(false);
  const url = getApiUrl();

  const { data: verified, isLoading } = useQuery({
    queryKey: ["verify_transaction", transaction_id],
    queryFn: async () => {
      if (!transaction_id) {
        throw new Error("Missing transaction id");
      }
      return verifyTransaction(transaction_id, url, rollbar);
    },
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => setShowContent(true), 200);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  const renderContent = () => {
    if (isLoading) return <LoadingState />;
    if (!verified?.isOk) return <ErrorState />;
    return (
      <SuccessState verified={verified as any} showContent={showContent} />
    );
  };

  return (
    <div className="relative h-[80vh] grid place-items-center p-4">
      <div className="w-full max-w-md">{renderContent()}</div>
    </div>
  );
}
