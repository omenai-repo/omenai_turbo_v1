"use client";

import { deletePromotionalData } from "@omenai/shared-services/promotionals/deletePromotionalData";
import { updatePromotionalData } from "@omenai/shared-services/promotionals/updatePromotionalData";
import { promotionalStore } from "@omenai/shared-state-store/src/promotionals/PromotionalStore";
import { PromotionalDataUpdateTypes } from "@omenai/shared-types";
import { LoadSmall } from "@omenai/shared-ui-components/components/loader/Load";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useState } from "react";
import { toast } from "sonner";

export default function UpdatePromotionalModalForm() {
  const { data, setData, setOpenModal } = promotionalStore();
  const [updateData, setUpdateData] = useState<PromotionalDataUpdateTypes>({
    headline: data?.headline,
    subheadline: data?.subheadline,
    cta: data?.cta,
  });

  const queryClient = useQueryClient();

  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  function handleInputChange(
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setUpdateData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  const router = useRouter();

  const handlePromotionalDataUpdate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (data === null) return;
    setLoading(true);

    const response = await updatePromotionalData(data.id, updateData);
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
        queryKey: ["promotional_data"],
      });
      setOpenModal(false);
      setData(null);
      router.refresh();
    }
  };

  const handleDeletePromotionalData = async () => {
    if (data === null) return;
    setDeleteLoading(true);

    const response = await deletePromotionalData(data.id);
    if (!response?.isOk) {
      toast.error("Error notification", {
        description: response?.message,
        style: {
          background: "red",
          color: "white",
        },
        className: "class",
      });
      setDeleteLoading(false);
    } else {
      setDeleteLoading(false);
      toast.success("Operation successful", {
        description: response.message,
        style: {
          background: "green",
          color: "white",
        },
        className: "class",
      });
      queryClient.invalidateQueries({
        queryKey: ["promotional_data"],
      });
      setOpenModal(false);
      setData(null);
      router.refresh();
    }
  };

  return (
    <div>
      <h1 className="text-base font-normal mb-4 text-dark">
        Update Promotional Data Info
      </h1>
      <form className="w-full" onSubmit={handlePromotionalDataUpdate}>
        <div className="space-y-2 mb-2 flex flex-col w-full">
          <div className="relative w-full h-auto">
            <label htmlFor="shipping" className="text-xs text-[#858585] mb-2">
              Headline
            </label>
            <input
              onChange={handleInputChange}
              name="headline"
              type="text"
              required
              value={updateData.headline}
              className="h-[40px] px-4 border border-dark/20 w-full text-xs focus:border-none focus:ring-1 focus:ring-dark focus:outline-none placeholder:text-xse"
            />
          </div>
        </div>
        <div className="space-y-2 mb-2 flex flex-col w-full">
          <div className="relative w-full h-auto">
            <label htmlFor="shipping" className="text-xs text-[#858585] mb-2">
              Subheadline
            </label>
            <input
              onChange={handleInputChange}
              name="subheadline"
              type="text"
              value={updateData.subheadline}
              required
              className="h-[40px] px-4 border border-dark/20 w-full text-xs focus:border-none focus:ring-1 focus:ring-dark focus:outline-none placeholder:text-xse"
            />
          </div>
        </div>
        <div className="space-y-2 mb-2 flex flex-col w-full">
          <div className="relative w-full h-auto">
            <label htmlFor="shipping" className="text-xs text-[#858585] mb-2">
              CTA (A link to this resource)
            </label>
            <input
              onChange={handleInputChange}
              name="cta"
              type="text"
              value={updateData.cta}
              required
              className="h-[40px] px-4 border border-dark/20 w-full text-xs focus:border-none focus:ring-1 focus:ring-dark focus:outline-none placeholder:text-xse"
            />
          </div>
        </div>

        <div className="w-full mt-5">
          <button
            disabled={loading || deleteLoading}
            type="submit"
            className="h-[40px] px-4 w-full text-xs text-white disabled:cursor-not-allowed disabled:bg-[#E0E0E0] hover:bg-dark/80 bg-dark duration-300 grid place-items-center"
          >
            {loading ? <LoadSmall /> : "Update this promotional content"}
          </button>
        </div>
      </form>
      <div className="w-full mt-3">
        <button
          disabled={loading || deleteLoading}
          type="submit"
          onClick={handleDeletePromotionalData}
          className="h-[40px] px-4 w-full text-xs text-white disabled:cursor-not-allowed disabled:bg-[#E0E0E0] hover:bg-red-600/80 bg-red-600 duration-300 grid place-items-center"
        >
          {deleteLoading ? <LoadSmall /> : "Delete this promotional content"}
        </button>
      </div>
    </div>
  );
}
