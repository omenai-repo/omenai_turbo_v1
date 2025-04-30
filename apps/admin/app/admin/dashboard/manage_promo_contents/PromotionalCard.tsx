"use client";
import { getPromotionalFileView } from "@omenai/shared-lib/storage/getPromotionalsFileView";
import { promotionalStore } from "@omenai/shared-state-store/src/promotionals/PromotionalStore";
import { PromotionalSchemaTypes } from "@omenai/shared-types";
import { ObjectId } from "mongoose";
import Link from "next/link";
import React from "react";
import { LuPencil } from "react-icons/lu";

export default function PromotionalCard({
  headline,
  subheadline,
  image,
  cta,
  id,
}: PromotionalSchemaTypes & { id: ObjectId }) {
  const url = getPromotionalFileView(image, 500);

  const { setData, setOpenModal } = promotionalStore();

  const handleUpdateButtonClick = () => {
    setData({ headline, subheadline, cta, id });
    setOpenModal(true);
  };
  return (
    <div className="w-full max-h-[300px] relative">
      <div className="grid grid-cols-3 w-full h-full border border-[#e0e0e0] rounded-md">
        <div className="col-span-1 h-full">
          <img
            className="w-full h-full object-cover object-center"
            src={url}
            alt={`${headline}-image`}
          />
        </div>
        <div className="col-span-2 p-4 flex flex-col space-y-3">
          <h1 className="text-fluid-base font-bold w-4/5">{headline}</h1>
          <h2 className="text-fluid-xs font-normal">{subheadline}</h2>

          <Link
            href={cta}
            className="cursor-pointer bg-dark text-white px-4 py-1.5 rounded-sm w-fit mt-5 text-fluid-xs"
          >
            View
          </Link>
        </div>
      </div>
      <button
        className="absolute top-4 right-4 grid place-items-center hover:bg-[#fafafa] cursor-pointer"
        onClick={handleUpdateButtonClick}
      >
        <LuPencil />
      </button>
    </div>
  );
}
