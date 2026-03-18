"use client";
import { PinInput } from "@mantine/core";
import { useState } from "react";
import { isRepeatingOrConsecutive } from "@omenai/shared-utils/src/checkIfPinRepeating";
import { setWalletPin } from "@omenai/shared-services/wallet/setWalletPin";
import { toast } from "sonner";
import { artistActionStore } from "@omenai/shared-state-store/src/artist/actions/ActionStore";
import { LoadSmall } from "@omenai/shared-ui-components/components/loader/Load";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { useRollbar } from "@rollbar/react";
import { BUTTON_CLASS } from "@omenai/shared-ui-components/components/styles/inputClasses";

export default function WalletPinModalForm() {
  const queryClient = useQueryClient();
  const { user, csrf } = useAuth({ requiredRole: "artist" });
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState({ isError: false, value: "" });
  const [loading, setLoading] = useState(false);
  const { toggleWalletPinPopup } = artistActionStore();
  const rollbar = useRollbar();

  const updatePin = (value: string) => {
    setError({ isError: false, value: "" });
    setPin(value);
  };

  const updateConfirmPin = (value: string) => {
    setError({ isError: false, value: "" });
    setConfirmPin(value);
  };

  const handlePinChange = async () => {
    // Security check: ensure user is loaded and wallet_id exists
    if (!user || !user.wallet_id) {
      setError({ isError: true, value: "User wallet information is missing." });
      return;
    }

    if (pin !== confirmPin) {
      setError({ isError: true, value: "Pins do not match" });
      return;
    }

    const isPinRepeatingOrConsecutive: boolean = isRepeatingOrConsecutive(pin);
    if (isPinRepeatingOrConsecutive) {
      setError({
        isError: true,
        value:
          "Wallet pin cannot be repeating or consecutive. Please try again",
      });
      return;
    }

    try {
      setLoading(true);
      const response = await setWalletPin(
        user.wallet_id as string,
        pin,
        csrf || "",
      );

      if (response === undefined || !response?.isOk) {
        toast.error("Error Notification", {
          description:
            response?.message ||
            "Something went wrong. Please try again or contact support",
          style: {
            background: "red",
            color: "white",
          },
          className: "class",
        });
        return;
      }

      toast.success("Operation successful", {
        description: response?.message || "Wallet pin successfully created",
        style: {
          background: "green",
          color: "white",
        },
        className: "class",
      });

      queryClient.invalidateQueries({ queryKey: ["fetch_wallet_screen"] });
      toggleWalletPinPopup(false);
    } catch (error) {
      if (error instanceof Error) {
        rollbar.error(error);
      } else {
        rollbar.error(new Error(String(error)));
      }
      toast.error("Error Notification", {
        description:
          "Something went wrong, please try again or contact support",
        style: {
          background: "red",
          color: "white",
        },
        className: "class",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fixed validation flaw: must be exactly 4 digits
  const isDisabled = () => {
    return pin.length !== 4 || confirmPin.length !== 4 || loading;
  };

  return (
    <div className="fixed inset-0 z-[100] flex h-[100dvh] w-full bg-white">
      {/* Left Column: Form Section */}
      <div className="relative flex w-full flex-col justify-center px-8 py-12 md:w-1/2 md:px-16 lg:px-24">
        {/* Optional Cancel Button */}
        <button
          onClick={() => toggleWalletPinPopup(false)}
          className="absolute left-8 top-8 text-sm font-medium text-slate-500 hover:text-slate-800"
        >
          ← Cancel
        </button>

        <div className="mx-auto w-full max-w-md space-y-10">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
              Create Wallet PIN
            </h2>
            <p className="text-base text-slate-600">
              Secure your artist wallet with a 4-digit PIN. You'll need this to
              authorize transactions.
            </p>
          </div>

          <div className="space-y-8">
            <div className="space-y-4">
              <label
                htmlFor="pin"
                className="block text-sm font-semibold text-gray-800"
              >
                Enter PIN
              </label>
              <PinInput
                size="md"
                name="pin"
                mask
                type="number"
                aria-label="Wallet pin"
                onChange={updatePin}
                error={error.isError}
                className="flex"
              />
            </div>

            <div className="space-y-4">
              <label
                htmlFor="confirm"
                className="block text-sm font-semibold text-gray-800"
              >
                Confirm PIN
              </label>
              <PinInput
                name="confirm"
                size="md"
                mask
                type="number"
                aria-label="Confirm wallet pin"
                onChange={updateConfirmPin}
                error={error.isError}
                className="flex"
              />
            </div>
          </div>

          {error.isError && (
            <div className="rounded -md border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-medium text-red-600">{error.value}</p>
            </div>
          )}

          <button
            disabled={isDisabled()}
            onClick={handlePinChange}
            className={`${BUTTON_CLASS} w-full py-3 text-base font-medium transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50`}
          >
            {loading ? <LoadSmall /> : "Secure My Wallet"}
          </button>
        </div>
      </div>

      {/* Right Column: Security Guidelines (Hidden on smaller screens) */}
      <div className="hidden w-1/2 flex-col justify-center bg-slate-950 px-16 py-12 md:flex lg:px-24">
        <div className="max-w-md space-y-10 text-white">
          <div className="space-y-3">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded -xl bg-indigo-500/20 text-indigo-400 mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                />
              </svg>
            </div>
            <h3 className="text-3xl font-semibold tracking-tight text-white">
              Best Practices for PIN Security
            </h3>
            <p className="text-slate-400 text-lg leading-relaxed">
              Your PIN is the master key to your digital earnings. Treat it with
              the same care as your bank PIN.
            </p>
          </div>

          <ul className="space-y-6">
            <li className="flex items-start">
              <span className="mr-4 flex h-6 w-6 shrink-0 items-center justify-center rounded -full bg-slate-800 text-indigo-400">
                1
              </span>
              <p className="text-slate-300">
                <strong className="block text-white">
                  Avoid repeating numbers.
                </strong>
                Combinations like 1111 or 0000 are easily guessed and are
                disabled by default.
              </p>
            </li>
            <li className="flex items-start">
              <span className="mr-4 flex h-6 w-6 shrink-0 items-center justify-center rounded -full bg-slate-800 text-indigo-400">
                2
              </span>
              <p className="text-slate-300">
                <strong className="block text-white">
                  Don't use sequential numbers.
                </strong>
                Combinations like 1234 or 9876 are highly vulnerable to attacks.
              </p>
            </li>
            <li className="flex items-start">
              <span className="mr-4 flex h-6 w-6 shrink-0 items-center justify-center rounded -full bg-slate-800 text-indigo-400">
                3
              </span>
              <p className="text-slate-300">
                <strong className="block text-white">Keep it private.</strong>
                Omenai staff will never ask for your PIN via email, chat, or
                phone.
              </p>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
