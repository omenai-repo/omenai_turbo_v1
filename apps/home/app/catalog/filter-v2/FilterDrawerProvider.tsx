"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface FilterDrawerContextType {
  isOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
}

const FilterDrawerContext = createContext<FilterDrawerContextType | undefined>(
  undefined
);

export const FilterDrawerProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);

  const openDrawer = () => setIsOpen(true);
  const closeDrawer = () => setIsOpen(false);

  return (
    <FilterDrawerContext.Provider value={{ isOpen, openDrawer, closeDrawer }}>
      {children}
    </FilterDrawerContext.Provider>
  );
};

export const useFilterDrawer = () => {
  const context = useContext(FilterDrawerContext);
  if (!context)
    throw new Error("useFilterDrawer must be used within FilterDrawerProvider");
  return context;
};
