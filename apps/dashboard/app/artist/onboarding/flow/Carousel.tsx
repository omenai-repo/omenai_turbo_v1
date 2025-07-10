"use client";
import React, { useCallback, useEffect, useState } from "react";
import { EmblaOptionsType } from "embla-carousel";
import useEmblaCarousel from "embla-carousel-react";
import ClassNames from "embla-carousel-class-names";

import CarouselItemText from "./CarouselItemText";
import CarouselItemSelect from "./CarouselItemSelect";
import {
  MdOutlineKeyboardArrowLeft,
  MdOutlineKeyboardArrowRight,
} from "react-icons/md";
import CarouselCVUpload from "./CarouselCVUpload";
import CarouselSocials from "./CarouselSocials";
import CarouselAcknowledgement from "./CarouselAcknowledgement";
import { ArtistOnboardingData } from "@omenai/shared-types";

const options: EmblaOptionsType = { containScroll: false };

const onboardingOptions = [
  {
    question: "Describe yourself and your art style",
    type: "text",
    label: "bio",
  },
  {
    question: "Are you a Graduate?",
    type: "select",
    label: "graduate",
    options: ["Yes", "No"],
  },
  {
    question: "Do you have an MFA (Masters in Fine Arts)?",
    type: "select",
    label: "mfa",
    options: ["Yes", "No"],
  },
  {
    question: "How many solo exhibitions have you had?",
    type: "text",
    label: "solo",
  },
  {
    question: "How many group exhibitions have you had?",
    type: "text",
    label: "group",
  },
  {
    question: "Which Bienalle have you participated in?",
    type: "select",
    label: "biennale",
    options: ["Venice", "Other", "None"],
  },
  {
    question: "Have you been featured in an Art Fair by a gallery?",
    type: "select",
    label: "art_fair",
    options: ["Yes", "No"],
  },
  {
    question: "Have your piece been featured in any Museum Exhibition",
    type: "select",
    label: "museum_exhibition",
    options: ["Yes", "No"],
  },
  {
    question: "Is your work featured in any Museum Collection?",
    type: "select",
    label: "museum_collection",
    options: ["Yes", "No"],
  },
  {
    question: "",
    type: "cv",
    label: "cv",
  },
  {
    question: "",
    type: "socials",
    label: "socials",
  },
  {
    question: "",
    type: "confirmation",
  },
];

const EmblaCarousel = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel(options, [ClassNames()]);

  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setActiveIndex(emblaApi!.selectedScrollSnap()); // Get current active slide
  }, [emblaApi]);

  const updateScrollProgress = () => {
    if (!emblaApi) return;
    const progress = Math.max(0, Math.min(1, emblaApi.scrollProgress()));
    setScrollProgress(progress);
  };

  useEffect(() => {
    if (!emblaApi) return;

    emblaApi.on("select", onSelect); // Listen for slide change
    onSelect(); // Initial check

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
    <div className="embla sm:max-w-[100vw] lg:max-w-[90vw] xl:max-w-[75vw] relative">
      <div className="embla__viewport" ref={emblaRef}>
        <div className="embla__container p-5">
          {onboardingOptions.map((options, index) => (
            <div className="embla__slide" key={index}>
              {options.type === "text" && (
                <CarouselItemText
                  question={options.question}
                  label={options.label as keyof ArtistOnboardingData}
                  isInteractable={index === activeIndex}
                />
              )}
              {options.type === "select" && options.options && (
                <CarouselItemSelect
                  question={options.question}
                  label={options.label}
                  options={options.options}
                  isInteractable={index === activeIndex}
                />
              )}
              {options.type === "cv" && (
                <CarouselCVUpload isInteractable={index === activeIndex} />
              )}
              {options.type === "socials" && (
                <CarouselSocials isInteractable={index === activeIndex} />
              )}
              {options.type === "confirmation" && (
                <CarouselAcknowledgement
                  isInteractable={index === activeIndex}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="w-full flex gap-x-4 items-center px-6 mb-4 mt-[6rem]">
        <div className=" w-full h-[1px] bg-[#fafafa]">
          <div
            className="h-full bg-dark "
            style={{ width: `${scrollProgress * 100}%` }}
          ></div>
        </div>

        <div className="flex items-center justify-center w-fit space-x-2">
          <button
            onClick={scrollPrev}
            className="h-[50px] w-[50px] rounded-full border border-[#e0e0e0] bg-dark text-white hover:border-dark duration-300 grid place-items-center"
          >
            <MdOutlineKeyboardArrowLeft />
          </button>
          <button
            onClick={scrollNext}
            className="h-[50px] w-[50px] rounded-full border border-[#e0e0e0] bg-dark text-white hover:border-dark duration-300 grid place-items-center"
          >
            <MdOutlineKeyboardArrowRight />
          </button>
        </div>
      </div>

      {/* <div className=" flex w-full justify-end">
        <div className="flex gap-x-2 items-center">
          <PrevButton onClick={onPrevButtonClick} />
          <NextButton onClick={onNextButtonClick} />
        </div>
      </div> */}
    </div>
  );
};

export default EmblaCarousel;
