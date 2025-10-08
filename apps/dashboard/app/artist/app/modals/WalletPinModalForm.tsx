"use client";

import { Paper, PinInput } from "@mantine/core";
import { useState } from "react";
import { isRepeatingOrConsecutive } from "@omenai/shared-utils/src/checkIfPinRepeating";
import { ArtistSchemaTypes } from "@omenai/shared-types";
import { setWalletPin } from "@omenai/shared-services/wallet/setWalletPin";
import { toast } from "sonner";
import { artistActionStore } from "@omenai/shared-state-store/src/artist/actions/ActionStore";
import { LoadSmall } from "@omenai/shared-ui-components/components/loader/Load";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";

export default function WalletPinModalForm() {
  const queryClient = useQueryClient();
  const { user, csrf } = useAuth({ requiredRole: "artist" });
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState({ isError: false, value: "" });
  const [loading, setLoading] = useState(false);
  const { toggleWalletPinPopup } = artistActionStore();

  const updatePin = (value: string) => {
    setError({ isError: false, value: "" });
    setPin(value);
  };

  const updateConfirmPin = (value: string) => {
    setError({ isError: false, value: "" });
    setConfirmPin(value);
  };

  const handlePinChange = async () => {
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
        csrf || ""
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

  const isDisabled = () => {
    if (
      pin.length < 4 ||
      confirmPin.length < 4 ||
      pin === "" ||
      confirmPin === ""
    )
      return true;
    return false;
  };

  return (
    <Paper radius="sm" className="p-8 shadow-sm border border-gray-100">
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-gray-900">
            Create Wallet PIN
          </h2>
          <p className="text-sm text-gray-500">
            Secure your wallet with a 4-digit PIN
          </p>
        </div>

        {/* PIN Input Fields */}
        <div className="space-y-6">
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Enter PIN
            </label>
            <PinInput
              size="lg"
              mask
              type="number"
              aria-label="Wallet pin"
              onChange={updatePin}
              error={error.isError}
              className="flex justify-center"
            />
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Confirm PIN
            </label>
            <PinInput
              size="lg"
              mask
              type="number"
              aria-label="Confirm wallet pin"
              onChange={updateConfirmPin}
              error={error.isError}
              className="flex justify-center"
            />
          </div>
        </div>

        {/* Error Message */}
        {error.isError && (
          <div className="rounded bg-red-50 border border-red-100 p-3">
            <p className="text-fluid-xxs text-red-600">{error.value}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          disabled={isDisabled() || loading}
          onClick={handlePinChange}
          className="w-full py-3 rounded bg-dark text-white text-fluid-xxs font-normal transition-all duration-200 hover:bg-dark/80 disabled:bg-dark/20 disabled:text-dark/40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? <LoadSmall /> : "Create PIN"}
        </button>
      </div>
    </Paper>
  );
}
