"use client";

import { Paper, PinInput } from "@mantine/core";
import { useState } from "react";
import { isRepeatingOrConsecutive } from "@omenai/shared-utils/src/checkIfPinRepeating";
import { ArtistSchemaTypes } from "@omenai/shared-types";
import { setWalletPin } from "@omenai/shared-services/wallet/setWalletPin";
import { toast } from "sonner";
import { LoadSmall } from "@omenai/shared-ui-components/components/loader/Load";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import React from "react";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";

export default function WalletPinResetForm() {
  const queryClient = useQueryClient();
  const { user, csrf } = useAuth({ requiredRole: "artist" });
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Centralized error handler
  const handleError = (message: string) => {
    setError(message);
    toast.error("Error Notification", {
      description: message,
      style: { background: "red", color: "white" },
    });
  };

  // Input handlers
  const updatePin = (value: string) => {
    setError(null);
    setPin(value);
  };

  const updateConfirmPin = (value: string) => {
    setError(null);
    setConfirmPin(value);
  };

  // Validation logic
  const validatePin = (): boolean => {
    if (pin !== confirmPin) {
      handleError("Pins do not match. Please try again.");
      return false;
    }
    if (isRepeatingOrConsecutive(pin)) {
      handleError(
        "Wallet pin cannot be repeating or consecutive. Please try again."
      );
      return false;
    }
    return true;
  };

  // Handle PIN update
  const handlePinChange = async () => {
    if (!validatePin()) return;

    try {
      setLoading(true);
      const response = await setWalletPin(
        user.wallet_id as string,
        pin,
        csrf || ""
      );

      if (!response?.isOk) {
        handleError(
          response?.message ||
            "Something went wrong. Please try again or contact support."
        );
        return;
      }

      toast.success("Operation successful", {
        description: response?.message || "Wallet pin successfully created.",
        style: { background: "green", color: "white" },
      });

      queryClient.invalidateQueries({ queryKey: ["fetch_wallet_screen"] });
      router.replace("/artist/app/wallet");
    } catch (error) {
      handleError("Something went wrong. Please try again or contact support.");
    } finally {
      setLoading(false);
    }
  };

  // Disable button logic
  const isDisabled = pin.length < 4 || confirmPin.length < 4 || loading;

  return (
    <Paper radius={"md"} className="flex flex-col space-y-6 w-fit my-8">
      <div className="flex flex-col space-y-6">
        {/* PIN Input */}
        <div className="flex flex-col space-y-4">
          <span className="font-medium text-fluid-xs">
            Enter new wallet pin
          </span>
          <PinInput
            size="lg"
            mask
            type="number"
            aria-label="Wallet pin"
            onChange={updatePin}
            error={!!error}
          />
        </div>

        {/* Confirm PIN Input */}
        <div className="flex flex-col space-y-4">
          <span className="font-medium text-fluid-xs">
            Confirm new wallet pin
          </span>
          <PinInput
            size="lg"
            mask
            type="number"
            aria-label="Confirm wallet pin"
            onChange={updateConfirmPin}
            error={!!error}
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <span className="text-fluid-xs text-red-600 my-1">{error}</span>
      )}

      {/* Submit Button */}
      <div className="w-fit flex justify-center my-4">
        <button
          disabled={isDisabled}
          onClick={handlePinChange}
          className="h-[35px] p-5 rounded w-fit flex items-center justify-center gap-3 disabled:cursor-not-allowed disabled:bg-dark/10 disabled:text-[#A1A1A1] bg-dark text-white text-fluid-xs font-normal"
        >
          {loading ? <LoadSmall /> : "Update wallet pin"}
        </button>
      </div>
    </Paper>
  );
}
