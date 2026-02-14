"use client";
import { AnimatePresence, motion } from "framer-motion";
import FormInput from "./components/FormInput";

// We'll use a premium easing curve (often seen in luxury brand sites)
export const transitionValues = {
  duration: 0.6,
  ease: [0.22, 1, 0.36, 1], // Custom cubic-bezier for a "fluid" feel
};

export default function IndividualLoginForm() {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="login-form-stage" // Unique key for AnimatePresence
        initial={{ opacity: 0, y: 10, scale: 0.99 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.99 }}
        transition={transitionValues}
        className="w-full relative"
      >
        {/* Container for the actual form content. 
            The gap-y-10 provides significant 'white space' which is 
            a hallmark of premium UI.
        */}
        <div className="flex flex-col w-full space-y-10">
          <div className="w-full">
            <FormInput />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
