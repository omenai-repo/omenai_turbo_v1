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
  const { user } = useAuth({ requiredRole: "artist" });
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
    console.log(pin, confirmPin);
    if (pin !== confirmPin) {
      setError({ isError: true, value: "Pins does not match" });
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
      const response = await setWalletPin(user.wallet_id as string, pin);

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
    <Paper radius={"lg"} className="flex flex-col space-y-6 p-3">
      <p className="font-semibold">Create wallet Pin</p>

      <div className="flex flex-col space-y-3">
        <div className="flex flex-col space-y-4">
          <span className="font-medium text-fluid-xs">Enter wallet pin</span>
          <PinInput
            size="lg"
            mask
            type="number"
            aria-label="Wallet pin"
            onChange={updatePin}
            error={error.isError}
          />
        </div>
        <div className="flex flex-col space-y-4">
          <span className="font-medium text-fluid-xs">Confirm wallet pin</span>
          <PinInput
            size="lg"
            mask
            type="number"
            aria-label="Confirm wallet pin"
            onChange={updateConfirmPin}
            error={error.isError}
          />
        </div>
      </div>
      <span className="text-fluid-xxs text-red-600 my-1">{error.value}</span>
      <div className="w-full flex justify-center my-4">
        <button
          disabled={isDisabled() || loading}
          onClick={handlePinChange}
          className="h-[35px] p-5 rounded-full w-full flex items-center justify-center gap-3 disabled:cursor-not-allowed disabled:bg-dark/10 disabled:text-[#A1A1A1] bg-dark text-white text-fluid-xxs font-normal"
        >
          {loading ? <LoadSmall /> : "Create pin"}
        </button>
      </div>
    </Paper>
  );
}
