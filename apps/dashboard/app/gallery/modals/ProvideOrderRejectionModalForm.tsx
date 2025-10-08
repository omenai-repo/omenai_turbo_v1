"use client";

import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { declineOrderRequest } from "@omenai/shared-services/orders/declineOrderRequest";
import { actionStore } from "@omenai/shared-state-store/src/actions/ActionStore";
import { OrderAcceptedStatusTypes } from "@omenai/shared-types";
import { LoadSmall } from "@omenai/shared-ui-components/components/loader/Load";
import { allKeysEmpty } from "@omenai/shared-utils/src/checkIfObjectEmpty";
import { toast_notif } from "@omenai/shared-utils/src/toast_notification";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useState } from "react";
import { toast } from "sonner";

export default function ProvideOrderRejectionModalForm() {
  const { toggleDeclineOrderModal, current_order_id, order_modal_metadata } =
    actionStore();
  const { csrf } = useAuth({ requiredRole: "gallery" });
  const queryClient = useQueryClient();
  const [accepted_status, setAcceptedStatus] =
    useState<OrderAcceptedStatusTypes>({
      status: "declined",
      reason: "",
    });
  const [loading, setLoading] = useState(false);

  function handleInputChange(
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setAcceptedStatus((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  const router = useRouter();

  const handleOrderRejection = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setLoading(true);
      if (allKeysEmpty(order_modal_metadata)) {
        toast_notif(
          "Invalid request params. Refresh your page. If this error persists, please contact support.",
          "error"
        );
        return;
      }
      const response = await declineOrderRequest(
        accepted_status,
        current_order_id,
        order_modal_metadata.seller_designation,
        order_modal_metadata.art_id,
        csrf || ""
      );
      if (!response?.isOk) {
        toast.error("Error notification", {
          description: response?.message,
          style: {
            background: "red",
            color: "white",
          },
          className: "class",
        });
        setLoading(false);
      } else {
        setLoading(false);
        toast.success("Operation successful", {
          description: response.message,
          style: {
            background: "green",
            color: "white",
          },
          className: "class",
        });
        queryClient.invalidateQueries({
          queryKey: ["fetch_orders_by_category"],
        });
        toggleDeclineOrderModal(false);
        router.refresh();
      }
    } catch (error) {
      toast_notif(
        "Something went wrong, please try again or contact support",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-fluid-base font-medium mb-4 text-dark">
        Sure to decline this order request?
      </h1>
      <form className="w-full" onSubmit={handleOrderRejection}>
        <div className="space-y-4 mb-2 flex flex-col w-full">
          <div className="relative w-full h-auto my-2 space-y-2">
            <label htmlFor="shipping" className="text-fluid-xxs text-dark mb-2">
              Provide a reason for declining order request
            </label>
            <textarea
              onChange={handleInputChange}
              name="reason"
              required
              rows={3}
              placeholder="e.g Artwork has been sold"
              className="w-full focus:ring ring-1 border-0 ring-dark/20 outline-none focus:outline-none focus:ring-dark transition-all duration-200 ease-in-out px-2 rounded placeholder:text-dark/40 text-fluid-xxs placeholder:text-fluid-xxs"
            />
          </div>
        </div>

        <div className="w-full  mt-5">
          <button
            disabled={loading}
            type="submit"
            className="h-[35px] p-5 rounded w-full flex items-center justify-center gap-3 disabled:cursor-not-allowed disabled:bg-dark/10 disabled:text-[#A1A1A1] bg-red-600 hover:bg-red-500 text-white text-fluid-xxs font-normal"
          >
            {loading ? <LoadSmall /> : " Decline order"}
          </button>
        </div>
      </form>
    </div>
  );
}
