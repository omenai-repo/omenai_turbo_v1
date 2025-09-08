"use client";
import { useEffect, useState, useCallback } from "react";
import { Loader, PinInput } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { sendOtp } from "@omenai/shared-services/wallet/sendOtp";
import { verifyOtp } from "@omenai/shared-services/wallet/verifyOtp";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";

export default function VerifyOTP({
  setVerification,
}: {
  setVerification: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { user, csrf } = useAuth({ requiredRole: "artist" });

  // State variables
  const [otp, setOtp] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const router = useRouter();
  // Derived state
  const canResend = timer === 0;

  // Centralized error handler
  const handleError = (message: string, description: string) => {
    toast.error(message, {
      description,
      style: { background: "red", color: "white" },
      className: "class",
    });
  };

  // Send OTP query
  const {
    isLoading: loading,
    refetch: resendOtp,
    isFetching,
  } = useQuery({
    queryKey: ["send_otp"],
    queryFn: async () => {
      const response = await sendOtp(user.artist_id, csrf || "");

      if (!response?.isOk) {
        handleError(
          "Error sending OTP",
          response?.message || "Please try again or contact support"
        );
        return false;
      }

      toast.success("OTP sent", {
        description: response?.message,
        style: { background: "green", color: "white" },
        className: "class",
      });

      setTimer(60); // Reset timer
      return true;
    },
    enabled: false, // Do not auto-fetch
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
    retry: 2, // Retry twice on failure
  });

  // Send OTP on first load
  useEffect(() => {
    resendOtp();
  }, [resendOtp]);

  // Countdown timer for resend
  useEffect(() => {
    if (timer > 0) {
      const timeout = setTimeout(() => setTimer((t) => t - 1), 1000);
      return () => clearTimeout(timeout);
    }
  }, [timer]);

  // Debounced OTP verification
  useEffect(() => {
    if (otp.length === 4) {
      const timeout = setTimeout(() => {
        setVerificationLoading(true);

        verifyOtp(user.artist_id, otp, csrf || "")
          .then((response: { isOk: boolean; message: string } | undefined) => {
            if (!response?.isOk) {
              handleError(
                "Verification failed",
                response?.message || "Please try again or contact support"
              );
              setOtp("");
              return;
            }

            toast.success("OTP Verified", {
              description: response.message,
              style: { background: "green", color: "white" },
              className: "class",
            });
            setOtpVerified(true);
          })
          .catch(() =>
            handleError(
              "Network error",
              "Please check your connection and try again"
            )
          )
          .finally(() => setVerificationLoading(false));
      }, 300); // Debounce 300ms

      return () => clearTimeout(timeout);
    }
  }, [otp, user.artist_id]);

  // Resend OTP handler
  const handleResendOtp = useCallback(() => {
    if (!canResend) return;
    resendOtp();
  }, [canResend, resendOtp]);

  return (
    <div>
      <div className="mt-8 flex flex-col space-y-6">
        <p className="text-fluid-xs">
          An OTP (One time password) has been sent to your registered email.
          Please enter the 4-digit code below
        </p>

        <div className="flex gap-x-4 items-center">
          <PinInput
            disabled={verificationLoading || otpVerified}
            size="md"
            mask
            type="number"
            value={otp}
            onChange={setOtp}
          />
          {verificationLoading && <Loader color="#0f172a" size="sm" />}
        </div>

        {otpVerified && (
          <div className="flex flex-col space-y-4">
            <p
              className="text-green-600 text-fluid-xxs font-semibold"
              aria-live="polite"
            >
              ✅ OTP successfully verified!
            </p>
            <button
              onClick={() => setVerification(otpVerified)}
              className="h-[35px] p-5 rounded-md w-fit flex items-center justify-center gap-3 disabled:cursor-not-allowed disabled:bg-dark/10 disabled:text-[#A1A1A1] bg-dark text-white text-fluid-xxs font-normal"
            >
              Proceed
            </button>
          </div>
        )}

        {loading && (
          <span className="text-fluid-xxs font-semibold " aria-live="polite">
            Sending OTP code. Please wait...
          </span>
        )}

        {!loading && !otpVerified && (
          <p className="text-fluid-xxs font-semibold">
            Didn’t get the code?{" "}
            <button
              className={` underline ${
                !canResend ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={!canResend}
              onClick={handleResendOtp}
            >
              {isFetching ? (
                <Loader color="#0f172a" size="xs" type="dots" />
              ) : canResend ? (
                "Resend OTP"
              ) : (
                `Resend in ${timer}s`
              )}
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
