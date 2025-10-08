"use client";

import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { declineOrderRequest } from "@omenai/shared-services/orders/declineOrderRequest";
import { artistActionStore } from "@omenai/shared-state-store/src/artist/actions/ActionStore";
import { OrderAcceptedStatusTypes } from "@omenai/shared-types";
import { LoadSmall } from "@omenai/shared-ui-components/components/loader/Load";
import { allKeysEmpty } from "@omenai/shared-utils/src/checkIfObjectEmpty";
import { toast_notif } from "@omenai/shared-utils/src/toast_notification";
import { useQueryClient } from "@tanstack/react-query";
import { AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useState } from "react";
import { toast } from "sonner";

export default function ProvideOrderRejectionModalForm() {
  const { toggleDeclineOrderModal, current_order_id, order_modal_metadata } =
    artistActionStore();
  const { csrf } = useAuth({ requiredRole: "artist" });

  const [checked, setChecked] = useState(false);

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
      if (order_modal_metadata.is_current_order_exclusive && !checked) {
        toast_notif("Please select a reason to proceed", "error");
        return;
      }
      if (allKeysEmpty(order_modal_metadata)) {
        toast_notif(
          "Invalid request params. Refresh your page. If this error persists, please contact support.",
          "error"
        );
        return;
      }
      const filter = {
        status: "declined" as "declined",
        reason:
          order_modal_metadata.is_current_order_exclusive && checked
            ? "Artwork is no longer available"
            : accepted_status.reason,
      };
      const response = await declineOrderRequest(
        filter,
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
        {order_modal_metadata.is_current_order_exclusive
          ? "Select reason for declining this order"
          : "Decline order request"}
      </h1>

      <form className="w-full" onSubmit={handleOrderRejection}>
        {order_modal_metadata.is_current_order_exclusive ? (
          <>
            {/* Checkbox Section */}
            <div className="space-y-4 mb-4">
              <label
                htmlFor="sold-off"
                className="flex items-center gap-3 cursor-pointer select-none"
              >
                <input
                  id="sold-off"
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => setChecked(e.target.checked)}
                  className="w-5 h-5 accent-red-600 cursor-pointer"
                />
                <span className="text-fluid-xxs text-dark">
                  Artwork has been sold off platform
                </span>
              </label>
            </div>

            {/* Collapsible Warning Box */}
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                checked ? "max-h-40 opacity-100 mt-2" : "max-h-0 opacity-0 mt-0"
              }`}
            >
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                <AlertTriangle className="text-red-600 w-5 h-5 mt-0.5 flex-shrink-0" />
                {/* TODO: Add link to terms of use here */}
                <p className="text-fluid-xxs text-red-600 leading-relaxed">
                  This artwork is still subject to Omenai&apos;s 90-day
                  exclusivity policy. In accordance with our Terms of Use, a 10%
                  penalty fee will be deducted from your next successful sale on
                  the platform.
                </p>
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-4 mb-2 flex flex-col w-full">
            <div className="relative w-full h-auto my-2 space-y-2">
              <label
                htmlFor="shipping"
                className="text-fluid-xxs text-dark mb-2"
              >
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
        )}

        {/* Submit Button */}
        <div className="w-full mt-5">
          <button
            disabled={!checked || loading}
            type="submit"
            className={`h-[35px] p-5 rounded w-full flex items-center justify-center gap-3 text-fluid-xxs font-normal transition-all duration-200 ease-in-out
              ${
                checked && !loading
                  ? "bg-red-600 hover:bg-red-500 text-white"
                  : "bg-dark/10 text-[#A1A1A1] cursor-not-allowed"
              }`}
          >
            {loading ? <LoadSmall /> : "Decline order request"}
          </button>
        </div>
      </form>
    </div>
  );
}
