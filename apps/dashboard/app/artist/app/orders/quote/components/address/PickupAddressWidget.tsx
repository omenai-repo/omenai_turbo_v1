"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import AddressDisplay from "./AddressDisplay";
import AddressForm from "./AddressForm";
import { AddressTypes, VerifyPickupChangePayload } from "@omenai/shared-types";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { updatePickupAddress } from "@omenai/shared-services/orders/updateOrderPickupAddress";
import { toast_notif } from "@omenai/shared-utils/src/toast_notification";
import { useQueryClient } from "@tanstack/react-query";

export type PickupAddressWidgetProps = {
  initialAddress: AddressTypes;
  order_id: string;
};

export default function PickupAddressWidget({
  initialAddress,
  order_id,
}: PickupAddressWidgetProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isRecentlyUpdated, setIsRecentlyUpdated] = useState(false);
  const [currentAddress, setCurrentAddress] =
    useState<AddressTypes>(initialAddress);
  const { csrf } = useAuth({ requiredRole: "artist" });
  const queryClient = useQueryClient();

  const [isLoading, setIsLoading] = useState(false);

  const handleEditClick = () => {
    setIsEditing(true);
    setIsRecentlyUpdated(false);
  };

  const handleSave = async (newAddress: AddressTypes) => {
    setIsLoading(true);
    try {
      const payload = {
        type: "pickup" as "pickup",
        pickupAddress: newAddress,
        order_id,
        token: csrf || "",
      };

      const { isOk, message } = await updatePickupAddress(payload);

      if (isOk) {
        setCurrentAddress(newAddress);
        setIsEditing(false);
        setIsRecentlyUpdated(true);
        await queryClient.invalidateQueries({ queryKey: ["get_single_order"] });
      } else {
        toast_notif(message || "Failed to update address", "error");
      }
    } catch (error) {
      console.log(error);
      toast_notif("Something went wrong while updating your address", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-full relative min-h-[300px]">
      <AnimatePresence mode="wait">
        {!isEditing ? (
          <AddressDisplay
            key="display"
            address={currentAddress}
            isRecentlyUpdated={isRecentlyUpdated}
            onEditClick={handleEditClick}
          />
        ) : (
          <AddressForm
            key="form"
            initialData={currentAddress}
            onSubmit={handleSave}
            isSaving={isLoading} // Updated prop name to reflect the backend verification/save
            onCancel={() => setIsEditing(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
