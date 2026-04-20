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
import { declineReasonMapping } from "./declineReasonMap";
import { useRollbar } from "@rollbar/react";
import Link from "next/link";
import { base_url } from "@omenai/url-config/src/config";
export default function ProvideOrderRejectionModalForm() {
  const { toggleDeclineOrderModal, current_order_id, order_modal_metadata } =
    artistActionStore();
  const { csrf } = useAuth({ requiredRole: "artist" });

  const declineReasons = Object.keys(declineReasonMapping);

  const [checked, setChecked] = useState(false);
  const rollbar = useRollbar();

  const queryClient = useQueryClient();

  const [accepted_status, setAcceptedStatus] =
    useState<OrderAcceptedStatusTypes>({
      status: "declined",
      reason: "",
    });

  const [loading, setLoading] = useState(false);

  const [selectedReason, setSelectedReason] = useState("");

  const toggleReason = (reason: string) => {
    setSelectedReason(reason);
    setAcceptedStatus((prev) => ({
      ...prev,
      reason: declineReasonMapping[reason],
    }));
  };

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
          "error",
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
        csrf || "",
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
      if (error instanceof Error) {
        rollbar.error(error);
      } else {
        rollbar.error(new Error(String(error)));
      }
      toast_notif(
        "Something went wrong, please try again or contact support",
        "error",
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
              <div className="bg-red-50 border border-red-200 rounded p-4 flex items-start gap-3">
                <AlertTriangle className="text-red-600 w-5 h-5 mt-0.5 flex-shrink-0" />
                <p className="text-fluid-xxs text-red-600 leading-relaxed">
                  This artwork is still subject to Omenai&apos;s 90-day
                  exclusivity policy. In accordance with our{" "}
                  <Link
                    className="underline font-bold"
                    target="_blank"
                    href={`${base_url()}/legal?ent=artist`}
                  >
                    Terms of Use
                  </Link>{" "}
                  , a 10% penalty fee will be deducted from your next successful
                  sale on the platform.
                </p>
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-4 mb-2 flex flex-col w-full">
            <p className="text-slate-700 text-fluid-xxs mb-4">
              Please choose a reasons that best explain why you&apos;re
              declining this order.
            </p>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
              {declineReasons.map((reason, index) => (
                <label
                  key={index}
                  htmlFor={`reason-${index}`}
                  className="flex items-start gap-3 cursor-pointer select-none group"
                >
                  <input
                    id={`reason-${index}`}
                    type="checkbox"
                    checked={selectedReason === reason}
                    onChange={() => toggleReason(reason)}
                    className="w-5 h-5 accent-red-600 cursor-pointer mt-1"
                  />
                  <span className="text-dark text-fluid-xxs leading-relaxed group-hover:text-dark/80">
                    {reason}
                  </span>
                </label>
              ))}

              {/* Other Option */}

              {accepted_status.reason && (
                <div className="mt-5 p-3 bg-red-50 border border-red-100 rounded text-fluid-xxs text-red-700">
                  <strong>Client interpretation:</strong>{" "}
                  {accepted_status.reason}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="w-full mt-5">
          <button
            disabled={
              (order_modal_metadata.is_current_order_exclusive && !checked) ||
              loading ||
              (!order_modal_metadata.is_current_order_exclusive &&
                (accepted_status.reason ?? "").trim() === "")
            }
            type="submit"
            className={`h-[35px] p-5 rounded w-full flex items-center justify-center gap-3 text-fluid-xxs font-normal transition-all duration-200 ease-in-out
              ${
                (order_modal_metadata.is_current_order_exclusive && checked) ||
                (!order_modal_metadata.is_current_order_exclusive &&
                  (accepted_status.reason ?? "").trim() !== "" &&
                  !loading)
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
