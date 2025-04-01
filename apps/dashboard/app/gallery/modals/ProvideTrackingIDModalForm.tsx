"use client";

import { updateOrderTrackingData } from "@omenai/shared-services/orders/updateTrackingInformation";
import { actionStore } from "@omenai/shared-state-store/src/actions/ActionStore";
import { TrackingInformationTypes } from "@omenai/shared-types";
import { LoadSmall } from "@omenai/shared-ui-components/components/loader/Load";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useState } from "react";
import { toast } from "sonner";

export default function UploadTrackingInformationModalForm() {
  const { toggleUploadTrackingInfoModal, current_order_id } = actionStore();
  const [tracking_info, setTrackingInfo] = useState<TrackingInformationTypes>({
    link: "",
    id: "",
  });

  const queryClient = useQueryClient();

  const [loading, setLoading] = useState(false);

  function handleInputChange(
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setTrackingInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  const router = useRouter();

  const handleSubmitTrackingInfo = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const response = await updateOrderTrackingData(
      tracking_info,
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
      toggleUploadTrackingInfoModal(false);
      router.refresh();
    }
  };

  return (
    <div>
      <h1 className="text-base font-bold mb-4 text-gray-700">
        Tracking information
      </h1>
      <form className="w-full" onSubmit={handleSubmitTrackingInfo}>
        <div className="space-y-2 mb-2 flex flex-col w-full">
          <div className="relative w-full h-auto flex flex-col space-y-1">
            <label
              htmlFor="shipping"
              className="text-[14px] text-[#858585] mb-2"
            >
              Package tracking link
            </label>
            <input
              onChange={handleInputChange}
              name="link"
              type="text"
              required
              placeholder="Please provide a link to track this order"
              className="w-full focus:ring ring-1 border-0 ring-dark/20 outline-none focus:outline-none focus:ring-dark transition-all duration-200 ease-in-out h-[40px] p-6 rounded-full placeholder:text-gray-700/40 placeholder:text-xs"
            />
          </div>
        </div>
        <div className="space-y-2 mb-2 flex flex-col w-full">
          <div className="relative w-full h-auto flex flex-col space-y-1">
            <label
              htmlFor="shipping"
              className="text-[14px] text-[#858585] mb-2"
            >
              Tracking ID
            </label>
            <input
              onChange={handleInputChange}
              name="id"
              type="text"
              placeholder="Please provide a tracking ID for this package"
              required
              className="w-full focus:ring ring-1 border-0 ring-dark/20 outline-none focus:outline-none focus:ring-dark transition-all duration-200 ease-in-out h-[40px] p-6 rounded-full placeholder:text-gray-700/40 placeholder:text-xs"
            />
          </div>
        </div>

        <div className="w-full mt-5">
          <button
            disabled={loading}
            type="submit"
            className="h-[40px] p-6 rounded-full w-full flex items-center justify-center gap-3 disabled:cursor-not-allowed disabled:bg-dark/10 disabled:text-[#A1A1A1] bg-dark text-white text-[14px] font-normal"
          >
            {loading ? <LoadSmall /> : " Submit tracking information"}
          </button>
        </div>
      </form>
    </div>
  );
}
