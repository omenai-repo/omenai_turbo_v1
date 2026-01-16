"use client";

import { getPromotionalFileView } from "@omenai/shared-lib/storage/getPromotionalsFileView";
import { PromotionalSchemaTypes } from "@omenai/shared-types";
import Image from "next/image";
import Link from "next/link";
import { IoIosArrowRoundForward } from "react-icons/io";
import DeletePromotionalModal from "../modals/DeletePromotionalModal";
import { ObjectId } from "mongoose";

export default function PromotionalCard({
  headline,
  subheadline,
  cta,
  image,
  isAdmin,
  id,
}: PromotionalSchemaTypes & { isAdmin: boolean; id: ObjectId }) {
  const imageUrl = getPromotionalFileView(image, 600, 300);

  return (
    <section
      className="
        relative h-[220px] w-full
        overflow-hidden rounded-xl
        border border-neutral-200
        bg-neutral-900
        transition
        hover:shadow-md
      "
    >
      {/* Image */}
      <div className="absolute inset-0">
        <Image
          src={imageUrl}
          alt={headline}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/50 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col justify-between p-4">
        <div className="max-w-[70%] space-y-2">
          <h3 className="text-fluid-sm font-semibold leading-snug text-white">
            {headline}
          </h3>
          <p className="text-fluid-xs leading-relaxed text-white/85 line-clamp-3">
            {subheadline}
          </p>
        </div>

        <Link href={cta} className="inline-flex w-fit items-center gap-1.5">
          <span className="text-fluid-xs font-medium text-white">Explore</span>
          <IoIosArrowRoundForward className="text-white transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      {/* Admin action */}
      {isAdmin && (
        <div className="absolute right-3 top-3 z-20">
          <DeletePromotionalModal advertTitle={headline} id={id} />
        </div>
      )}
    </section>
  );
}
