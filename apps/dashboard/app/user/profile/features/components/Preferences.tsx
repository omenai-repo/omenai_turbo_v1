"use client";

import { AnimatePresence, motion } from "framer-motion";
import Pill from "./Pill";

let artTypes = [
  "Photography",
  "Works on paper",
  "Acrylic on canvas/linen/panel",
  "Mixed media on paper/canvas",
  "Sculpture (Resin/plaster/clay)",
  "Oil on canvas/panel",
  "Sculpture (Bronze/stone/metal)",
];
export default function Preferences() {
  return (
    <div className="w-full w-full">
      <AnimatePresence>
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <label
              htmlFor="artType-preferences"
              className="text-lg font-semibold text-slate-900"
            >
              Art Preferences
            </label>
          </div>

          {/* Pills Container */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <div className="flex flex-wrap gap-2">
              {artTypes.map((art, index) => (
                <motion.div
                  key={art + index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    duration: 0.2,
                    delay: index * 0.03,
                    ease: "easeOut",
                  }}
                >
                  <Pill text={art} />
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Optional Helper Text */}
          <p className="text-sm text-slate-600 mt-3">
            Select your preferred art styles to personalize your experience
          </p>
        </div>
      </AnimatePresence>
    </div>
  );
}
