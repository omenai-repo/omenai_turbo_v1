import { useState, useEffect, useCallback } from "react";
import EditorialItemCard from "@omenai/shared-ui-components/components/editorials/EditorialItemCard";
import useEmblaCarousel from "embla-carousel-react";
import {
  MdOutlineKeyboardArrowLeft,
  MdOutlineKeyboardArrowRight,
} from "react-icons/md";
import { EditorialSchemaTypes } from "@omenai/shared-types";

export default function EditorialGridItemsList({
  editorials,
}: {
  editorials: EditorialSchemaTypes[];
}) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start", // Aligns items to the left (Gallery wall style)
    loop: false,
    dragFree: true, // Allows smooth "analog" dragging feel
    containScroll: "trimSnaps",
  });

  const [scrollProgress, setScrollProgress] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [totalSlides, setTotalSlides] = useState(0);

  // Sync Progress & Index
  const onScroll = useCallback((api: any) => {
    const progress = Math.max(0, Math.min(1, api.scrollProgress()));
    setScrollProgress(progress);
  }, []);

  const onSelect = useCallback((api: any) => {
    setCurrentIndex(api.selectedScrollSnap());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;

    onScroll(emblaApi);
    setTotalSlides(emblaApi.scrollSnapList().length);

    emblaApi.on("scroll", onScroll);
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    emblaApi.on("resize", onScroll);

    return () => {
      emblaApi.off("scroll", onScroll);
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
      emblaApi.off("resize", onScroll);
    };
  }, [emblaApi, onScroll, onSelect]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  return (
    <section className="w-full bg-[#FAFAFA] py-8">
      {/* 1. Header / Architectural Line */}
      <div className="mb-8 w-full border-t border-neutral-200 px-4 pt-4 lg:px-8">
        <span className="font-mono text-xs uppercase tracking-widest text-neutral-400">
          Editorial Archive
        </span>
      </div>

      {/* 2. Carousel Container */}
      <div className="embla overflow-hidden" ref={emblaRef}>
        {/* gap-x-8 adds breath; pl-4/8 ensures the first item isn't flush with the browser edge */}
        <div className="embla__container flex gap-x-8 pl-4 lg:pl-8">
          {editorials.map((editorial) => {
            return (
              <div
                className="embla__slide min-w-0 flex-[0_0_auto]"
                key={editorial.slug}
              >
                {/* Force width here if not handled in child */}
                <div className="w-[300px] md:w-[350px]">
                  <EditorialItemCard editorial={{ ...editorial }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Controls & Metadata Wrapper */}
      <div className="mt-12 flex w-full flex-col gap-6 px-4 lg:px-8 md:flex-row md:items-end md:justify-between">
        {/* Progress Timeline */}
        <div className="relative h-[1px] w-full max-w-md bg-neutral-200 md:order-2 md:flex-1 md:mx-12">
          <div
            className="absolute top-0 left-0 h-full bg-dark transition-all duration-300 ease-out"
            style={{ width: `${scrollProgress * 100}%` }}
          />
        </div>

        {/* Navigation & Counter */}
        <div className="flex items-center justify-between gap-6 md:order-3 md:justify-end">
          {/* Index Counter (The "Technical" Detail) */}
          <div className="font-mono text-sm tracking-widest text-neutral-900">
            {String(currentIndex + 1).padStart(2, "0")}
            <span className="mx-2 text-neutral-300">/</span>
            {String(totalSlides).padStart(2, "0")}
          </div>

          {/* Square Buttons (Ghost Style) */}
          <div className="flex gap-[-1px]">
            {" "}
            {/* Negative gap connects borders if you want that joined look */}
            <button
              onClick={scrollPrev}
              disabled={currentIndex === 0}
              className="group flex h-12 w-12 items-center justify-center border border-neutral-200 bg-white text-neutral-900 transition-all duration-300 hover:border-black hover:bg-dark hover:text-white disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-neutral-900 rounded-none"
            >
              <MdOutlineKeyboardArrowLeft className="text-xl" />
            </button>
            <button
              onClick={scrollNext}
              disabled={currentIndex === totalSlides - 1}
              className="group flex h-12 w-12 items-center justify-center border-y border-r border-neutral-200 bg-white text-neutral-900 transition-all duration-300 hover:border-black hover:bg-dark hover:text-white disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-neutral-900 rounded-none"
            >
              <MdOutlineKeyboardArrowRight className="text-xl" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
