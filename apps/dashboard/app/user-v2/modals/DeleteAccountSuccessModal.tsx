"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth_uri } from "@omenai/url-config/src/config";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { toast_notif } from "@omenai/shared-utils/src/toast_notification";

export default function DeleteAccountSuccessModal() {
  const [countdown, setCountdown] = useState(10);
  const router = useRouter();

  const { signOut } = useAuth({ requiredRole: "user" }); // to access auth context if needed

  useEffect(() => {
    if (countdown <= 0) {
      toast_notif("Logging you out...", "info");
      (async () => await signOut())();
      return;
    }

    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, router]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4  backdrop-blur-sm bg-dark/70">
      <div className="relative bg-white dark:bg-slate-800 rounded shadow-2xl w-full max-w-md px-6 py-8 z-10">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded bg-red-100 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-red-600"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>

          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Account Deletion Scheduled
            </h3>
            <p className="mt-2 text-fluid-xs text-slate-800 dark:text-slate-300 leading-relaxed">
              Your account has been scheduled for deletion. It will be retained
              for the next{" "}
              <span className="font-medium text-slate-800 dark:text-slate-100">
                30 days
              </span>{" "}
              — Logging in during this period will automatically reactivate your
              account.
            </p>
            <p className="mt-4 text-fluid-xs font-normal text-slate-600 dark:text-slate-400">
              Redirecting you to login page in{" "}
              <span className="text-slate-900 dark:text-white">
                {countdown}s
              </span>
              ...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
