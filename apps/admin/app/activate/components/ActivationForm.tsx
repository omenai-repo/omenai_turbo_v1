import { IndividualLogo } from "@omenai/shared-ui-components/components/logo/Logo";
import { AnimatePresence, motion } from "framer-motion";
import ActivationFormInputs from "./ActivationFormInputs";

export default function ActivationForm() {
  return (
    <AnimatePresence key={4}>
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ y: 100 }}
        transition={{ duration: 0.33 }}
        className="w-full h-full flex items-center gap-x-8"
      >
        <div className="flex flex-col space-y-8 w-full ">
          <div className="text-fluid-xxs ">
            <IndividualLogo />
          </div>
          <div className="flex flex-col space-y-10 w-full">
            <h1 className="text-fluid-base sm:text-fluid-sm font-bold">
              Activate your Admin account
            </h1>

            <ActivationFormInputs />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
