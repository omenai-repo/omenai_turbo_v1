"use client";

import { AnimatePresence, motion } from "framer-motion";
import Pill from "./components/Pill";
import { useIndividualAuthStore } from "@omenai/shared-state-store/src/auth/register/IndividualAuthStore";
import { useArtistAuthStore } from "@omenai/shared-state-store/src/auth/register/ArtistAuthStore";
let artTypes = [
  "Photography",
  "Works on paper",
  "Acrylic on canvas/linen/panel",
  "Mixed media on paper/canvas",
  "Oil on canvas/panel",
];
function ArtStyle() {
  const { artistSignupData } = useArtistAuthStore();
  return (
    <AnimatePresence key={7}>
      <div className="">
        <p className="text-fluid-xxs font-light text-center">
          Choose an art style that best represents your work.
        </p>
        <p className="text-center text-fluid-xxs font-semibold my-[1.5rem]">
          Selected art style: {artistSignupData.art_style}
        </p>

        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ y: -100 }}
          transition={{ duration: 0.33 }}
        >
          <div className="flex flex-wrap justify-center my-6 gap-y-3 gap-x-1">
            {artTypes.map((art, index) => {
              return (
                <Pill
                  key={art + index}
                  text={art}
                  art_styles={artTypes}
                  logo={
                    art === "Mixed media"
                      ? "mixed-media_art"
                      : `${art.toLowerCase()}_art`
                  }
                />
              );
            })}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default ArtStyle;
