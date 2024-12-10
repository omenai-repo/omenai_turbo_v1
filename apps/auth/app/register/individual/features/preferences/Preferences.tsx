"use client";

import { AnimatePresence, motion } from "framer-motion";
import Pill from "./components/Pill";
import { MdOutlineArrowForward } from "react-icons/md";
import { useIndividualAuthStore } from "@omenai/shared-state-store/src/auth/register/IndividualAuthStore";
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
function Preferences() {
  const {
    decrementCurrentSignupFormIndex,
    incrementCurrentSignupFormIndex,
    preferences,
    isLoading,
  } = useIndividualAuthStore();
  return (
    <AnimatePresence key={7}>
      <div className="container">
        <p className="text-xs font-normal text-center">
          We would like understand your art interests, please select up to 5
          artwork mediums that resonates with you most
        </p>
        <p className="text-center text-xs font-semibold my-[1.5rem]">
          Selected: {preferences.length}/5
        </p>

        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ y: -100 }}
          transition={{ duration: 0.33 }}
        >
          <div className="flex flex-wrap justify-center gap-y-[1rem] gap-x-[0.5rem]">
            {artTypes.map((art, index) => {
              return <Pill key={art} text={art} />;
            })}
          </div>
          {/* Submit */}
          <div className="flex gap-4 justify-end my-5">
            <button
              className={` h-[40px] px-4 mt-[1rem] text-xs font-normal bg-dark text-white flex justify-center items-center gap-x-2 hover:bg-dark/30 transition-all ease-linear duration-200`}
              type={"button"}
              onClick={decrementCurrentSignupFormIndex}
            >
              Back
            </button>
            <button
              disabled={isLoading || preferences.length < 5}
              onClick={incrementCurrentSignupFormIndex}
            >
              <span>Next</span>
              <MdOutlineArrowForward />
              <span>Next</span>
              <MdOutlineArrowForward />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default Preferences;
