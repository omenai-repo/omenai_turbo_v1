"use client";

import { AnimatePresence, motion } from "framer-motion";
import Pill from "./Pill";

let artTypes = [
  "Acyllic",
  "Oil",
  "Fabric",
  "Mixed media",
  "Ink",
  "Ankara",
  "Photography",
  "Collage or other works on paper",
  "Charcoal",
  "Canvas",
  "Paper",
];
export default function Preferences() {
  return (
    <AnimatePresence>
      <label
        htmlFor="artType-preferences"
        className="text-[14px] font-normal text-gray-700"
      >
        Preferences
      </label>
      <div className="my-4">
        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ y: -100 }}
          transition={{ duration: 0.33 }}
        >
          <div className="flex flex-wrap  gap-y-[1rem] gap-x-[0.5rem] text-[14px]">
            {artTypes.map((art, index) => {
              return (
                <div key={art + index}>
                  <Pill text={art} />
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
