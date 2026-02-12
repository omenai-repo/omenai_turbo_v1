"use client";

import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { confirmOrderDelivery } from "@omenai/shared-services/orders/confirmOrderDelivery";
import { actionStore } from "@omenai/shared-state-store/src/actions/ActionStore";
import { LoadSmall } from "@omenai/shared-ui-components/components/loader/Load";
import { useRollbar } from "@rollbar/react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { IoWarning } from "react-icons/io5";
import { toast } from "sonner";

export default function ConfirmOrderDeliveryForm() {
  const [loading, setLoading] = useState<boolean>(false);
  const { csrf } = useAuth({ requiredRole: "user" });
  const { confirmOrderDeliveryPopup, updateConfirmOrderDeliveryPopup } =
    actionStore();
  const router = useRouter();

  const queryClient = useQueryClient();
  const rollbar = useRollbar();

  async function confirmDelivery() {
    setLoading(true);
    const response = await confirmOrderDelivery(
      true,
      confirmOrderDeliveryPopup.order_id,
      csrf || "",
    );
    try {
      if (!response?.isOk)
        toast.error("Error notification", {
          description: response?.message,
          style: {
            background: "red",
            color: "white",
          },
          className: "class",
        });
      else {
        toast.success("Operation successful", {
          description: response?.message,
          style: {
            background: "green",
            color: "white",
          },
          className: "class",
        });
        await queryClient.invalidateQueries({ queryKey: ["user_orders_page"] });
        router.refresh();
      }
    } catch (error) {
      if (error instanceof Error) {
        rollbar.error(error);
      } else {
        rollbar.error(new Error(String(error)));
      }
      toast.error("Error notification", {
        description: "Something went wrong, try again or contact support",
        style: {
          background: "red",
          color: "white",
        },
        className: "class",
      });
    } finally {
      setLoading(false);
      updateConfirmOrderDeliveryPopup(false, "");
    }
  }

  return (
    <div>
      <h1 className="text-fluid-sm font-light mb-4 text-dark">
        Confirm order delivery
      </h1>
      <div className="flex flex-col gap-4 font-light text-fluid-base">
        <div className="bg-[#fafafa] p-5 flex flex-col gap-3">
          <p className="font-bold flex items-center gap-x-2">
            <IoWarning className="text-fluid-md text-[#FFA500]" />
          </p>

          <p className="text-fluid-xxs">
            By confirming you are acknowledging that the artwork has been
            delivered to you in good condition. If you mistakenly confirm or
            encounter any issues with your order, please contact customer
            service immediately, as this action cannot be undone.
          </p>
        </div>
      </div>

      <div className="w-full mt-5 flex items-center gap-x-2">
        <button
          disabled={loading}
          type="button"
          onClick={confirmDelivery}
          className="h-[35px] p-5 rounded w-full flex items-center justify-center gap-3 disabled:cursor-not-allowed disabled:bg-dark/10 disabled:text-[#A1A1A1] bg-dark text-white text-fluid-xxs font-light"
        >
          {loading ? <LoadSmall /> : "I understand, confirm delivery"}
        </button>
      </div>
    </div>
  );
}
