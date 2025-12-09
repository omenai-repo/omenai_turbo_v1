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
    <div className="flex flex-col gap-4">
      <PriceFilter
        open={openSection === "price"}
        toggleOpen={() => handleToggle("price")}
      />
      <YearFilter
        open={openSection === "year"}
        toggleOpen={() => handleToggle("year")}
      />
      <MediumFilter
        open={openSection === "medium"}
        toggleOpen={() => handleToggle("medium")}
      />
      <RarityFilter
        open={openSection === "rarity"}
        toggleOpen={() => handleToggle("rarity")}
      />
    </div>
  );
}
