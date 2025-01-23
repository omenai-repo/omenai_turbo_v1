"use client";

import { declineOrderRequest } from "@omenai/shared-services/orders/declineOrderRequest";
import { actionStore } from "@omenai/shared-state-store/src/actions/ActionStore";
import { OrderAcceptedStatusTypes } from "@omenai/shared-types";
import { LoadSmall } from "@omenai/shared-ui-components/components/loader/Load";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useState } from "react";
import { toast } from "sonner";

export default function ProvideOrderRejectionModalForm() {
  const { toggleDeclineOrderModal, current_order_id } = actionStore();
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
    setLoading(true);
    const response = await declineOrderRequest(
      accepted_status,
      current_order_id
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
  };

  return (
    <div>
      <h1 className="text-base font-normal mb-4 text-dark">Sure to decline?</h1>
      <form className="w-full" onSubmit={handleOrderRejection}>
        <div className="space-y-2 mb-2 flex flex-col w-full">
          <div className="relative w-full h-auto my-2">
            <label
              htmlFor="shipping"
              className="text-[14px] text-[#858585] mb-2"
            >
              Reason for declining request
            </label>
            <input
              onChange={handleInputChange}
              name="reason"
              type="text"
              required
              placeholder="e.g Artwork no longer available"
              className="w-full focus:ring ring-1 border-0 ring-dark/20 outline-none focus:outline-none focus:ring-dark transition-all duration-200 ease-in-out h-[40px] p-6 rounded-full placeholder:text-dark/40"
            />
          </div>
        </div>

        <div className="w-full  mt-5">
          <button
            disabled={loading}
            type="submit"
            className="h-[40px] p-6 rounded-full w-full flex items-center justify-center gap-3 disabled:cursor-not-allowed disabled:bg-gray-400 disabled:text-[#A1A1A1] bg-red-600 hover:bg-red-500 text-white text-[14px] font-normal"
          >
            {loading ? <LoadSmall /> : " Decline order"}
          </button>
        </div>
      </form>
    </div>
  );
}
