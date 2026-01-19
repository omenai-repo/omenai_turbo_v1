"use client";

import { useState } from "react";
import PriceFilter from "./PriceFilter";
import YearFilter from "./YearFilter";
import MediumFilter from "./MediumFilter";
import RarityFilter from "./RarityFilter";

export default function FilterSections() {
  const [openSection, setOpenSection] = useState<string | null>(null);

  const handleToggle = (section: string) => {
    setOpenSection((prev) => (prev === section ? null : section));
  };

  return (
    <div className="flex flex-col">
      <PriceFilter
        open={openSection === "price"}
        toggleOpen={() => handleToggle("price")}
      />
      <div className="h-[1px] w-full bg-neutral-100" />
      <YearFilter
        open={openSection === "year"}
        toggleOpen={() => handleToggle("year")}
      />
      <div className="h-[1px] w-full bg-neutral-100" />
      <MediumFilter
        open={openSection === "medium"}
        toggleOpen={() => handleToggle("medium")}
      />
      <div className="h-[1px] w-full bg-neutral-100" />
      <RarityFilter
        open={openSection === "rarity"}
        toggleOpen={() => handleToggle("rarity")}
      />
    </div>
  );
}
