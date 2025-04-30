import { useState, useEffect, useCallback } from "react";
import EditorialItem, { EditorialItemProps } from "./EditorialItem";
import useEmblaCarousel from "embla-carousel-react";
import {
  MdOutlineKeyboardArrowLeft,
  MdOutlineKeyboardArrowRight,
} from "react-icons/md";

export default function EditorialGridItemsList({
  editorials,
}: {
  editorials: EditorialItemProps[];
}) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    watchDrag: true,
  });
  const [scrollProgress, setScrollProgress] = useState(0);

  const updateScrollProgress = () => {
    if (!emblaApi) return;
    const progress = Math.max(0, Math.min(1, emblaApi.scrollProgress()));
    setScrollProgress(progress);
  };

  useEffect(() => {
    if (!emblaApi) return;

    const handleScroll = () => {
      requestAnimationFrame(updateScrollProgress);
    };

    emblaApi.on("scroll", handleScroll);
    emblaApi.on("resize", updateScrollProgress);
    updateScrollProgress(); // Initial progress update

    return () => {
      emblaApi.off("scroll", handleScroll);
      emblaApi.off("resize", updateScrollProgress);
    };
  }, [emblaApi]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) {
      emblaApi.scrollPrev();
    }
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) {
      emblaApi.scrollNext();
    }
  }, [emblaApi]);
  return (
    <div>
      <div className="embla" ref={emblaRef}>
        <div className="embla__container">
          {editorials.map((editorial, index) => {
            return (
              <div className="embla__slide" key={editorial.$id}>
                <EditorialItem
                  title={editorial.title}
                  date={editorial.date}
                  minutes={editorial.minutes}
                  cover={editorial.cover}
                  summary={editorial.summary}
                  $id={editorial.$id}
                  link={editorial.link}
                />
              </div>
            );
          })}
        </div>
      </div>

      <div className="w-full flex gap-x-4 items-center my-3">
        <div className=" w-full h-[1px] bg-[#fafafa]">
          <div
            className="h-full bg-dark "
            style={{ width: `${scrollProgress * 100}%` }}
          ></div>
        </div>

        <div className="flex items-center justify-center w-fit space-x-2">
          <button
            onClick={scrollPrev}
            className="h-[35px] w-[40px] rounded-full border border-[#e0e0e0] bg-transparent hover:border-dark duration-300 grid place-items-center"
          >
            <MdOutlineKeyboardArrowLeft />
          </button>
          <button
            onClick={scrollNext}
            className="h-[35px] w-[40px] rounded-full border border-[#e0e0e0] bg-transparent hover:border-dark duration-300 grid place-items-center"
          >
            <MdOutlineKeyboardArrowRight />
          </button>
        </div>
      </div>

      {/* <div className="flex relative gap-x-4 overflow-x-scroll w-full"></div> */}
    </div>
  );
}
