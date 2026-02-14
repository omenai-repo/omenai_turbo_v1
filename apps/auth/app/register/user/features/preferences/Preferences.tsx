"use client";

import { AnimatePresence, motion } from "framer-motion";
import Pill from "./components/Pill";
import { useIndividualAuthStore } from "@omenai/shared-state-store/src/auth/register/IndividualAuthStore";
import ActionButton from "../actions/ActionButton";
let artTypes = [
  "Photography",
  "Works on paper",
  "Acrylic on canvas/linen/panel",
  "Mixed media on paper/canvas",
  "Oil on canvas/panel",
];
function Preferences() {
  const { preferences } = useIndividualAuthStore();
  return (
    <AnimatePresence key={7}>
      <div className="">
        <p className="text-fluid-xxs font-medium text-center">
          Select artwork mediums that resonate with you.
        </p>
        <p className="text-center text-fluid-xxs font-semibold my-[1.5rem]">
          Selected: {preferences.length}/5
        </p>

        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ y: -100 }}
          transition={{ duration: 0.33 }}
        >
          <div className="flex flex-wrap justify-center gap-y-3 gap-x-1">
            {artTypes.map((art, index) => {
              return (
                <Pill
                  key={art + index}
                  text={art}
                  logo={
                    art === "Mixed media"
                      ? "mixed-media_art"
                      : `${art.toLowerCase()}_art`
                  }
                  artTypes={artTypes}
                />
              );
            })}
          </div>
        </motion.div>
      </div>
      <ActionButton preference_chosen={preferences.length > 0} />
    </AnimatePresence>
  );
}

export default Preferences;
