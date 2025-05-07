"use client";
import { getPromotionalFileView } from "@omenai/shared-lib/storage/getPromotionalsFileView";
import { PromotionalSchemaTypes } from "@omenai/shared-types";
import Image from "next/image";
import Link from "next/link";
import { IoIosArrowRoundForward } from "react-icons/io";

export default function SingleSlide({
  headline,
  subheadline,
  cta,
  image,
}: PromotionalSchemaTypes) {
  const image_url = getPromotionalFileView(image, 250, 200, "webp");

  return (
    <section className="min-w-[200px] w-[300px] sm:w-[400px] sm:max-w-[400px] bg-dark flex h-[200px] items-center p-2 xs:p-4 rounded-lg">
      <div className="text-white p-2 flex col-span-1 w-full flex-col gap-y-3">
        <p className="text-fluid-xs font-semibold">{headline}</p>
        <p className="text-fluid-xxs font-medium">{subheadline}</p>
        <Link href={cta} className="group">
          <button className="flex items-center gap-x-2 bg-dark group-hover:bg-white group-hover:text-dark ring-1 ring-white group-hover:ring-dark duration-200 text-white px-3 xs:px-4 py-1.5 xs:py-2 text-fluid-xxs rounded-full">
            <span>Explore</span>
            <IoIosArrowRoundForward />
          </button>
        </Link>
      </div>
      <div className="col-span-1">
        <Image
          width={200}
          height={200}
          className="max-h-full object-center rounded-md w-full sm:w-[200px] object-fit h-[200px] sm:h-[180px] object-cover"
          src={image_url}
          alt={`hero image ${headline}`}
        />
      </div>
    </section>
  );
}
