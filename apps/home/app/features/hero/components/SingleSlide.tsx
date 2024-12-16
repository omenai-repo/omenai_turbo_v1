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
  const image_url = getPromotionalFileView(image, 400, 500, "webp");

  return (
    <section className="w-full md:p-0">
      <div className="w-full grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8 items-center bg-[#fafafa]">
        <div className="col-span-1">
          <Image
            width={300}
            height={300}
            className="w-full max-h-[300px] md:max-h-[500px] object-fit object-bottom h-[300px] md:h-[400px] lg:h-[500px]"
            src={image_url}
            alt={`hero image ${headline}`}
          />
        </div>
        <div className="w-full col-span-1 lg:col-span-2 flex flex-col gap-y-4 my-2 container pb-4 px-4 mx-auto justify-center lg:w-7/8 xl:w-3/4 sm:w-full">
          <div className="w-full flex flex-col space-y-3 justify-center ">
            <h1 className="text-sm sm:text-md lg:text-lg xl:text-xl md:w-full my-0 font-light text-left leading-tight drop-shadow-2xl ">
              {headline}
            </h1>
            <p className="text-base text-[#858585] font-light italic md:text-sm">
              {subheadline}
            </p>
            <Link href={cta} className="hidden lg:block">
              <button className="grid disabled:cursor-not-allowed disabled:bg-dark/20 place-items-center rounded-sm bg-dark h-[40px] px-4 text-xs text-white hover:bg-dark/90">
                View resource
              </button>
            </Link>
            <Link
              href={cta}
              className="lg:hidden flex items-center space-x-2 my-4"
            >
              <span className="text-xs font-normal">View resource</span>
              <IoIosArrowRoundForward />
            </Link>
          </div>
        </div>
      </div>
      <hr className="border-dark/10" />
    </section>
  );
}
