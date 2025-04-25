"use client";
import { useState } from "react";

import CardInput from "./CardInput";
import OtpInput from "./OtpInput";
import VerifyTransaction from "./VerifyTransaction";
import AuthPinInput from "./AuthPinInput";
import AvsNoauthInput from "./AvsNoauthInput";
import { AnimatePresence, motion } from "framer-motion";
import { SubscriptionPlanDataTypes } from "@omenai/shared-types";
import Load from "@omenai/shared-ui-components/components/loader/Load";

export function CheckoutStepper({
  plan,
}: {
  plan?: SubscriptionPlanDataTypes & { createdAt: string; updatedAt: string };
}) {
  const [activeStep, setActiveStep] = useState(0);

  const [trans_id, set_trans_id] = useState<string>("");
  const [validateChargeAuthorization, setValidateChargeAuthorization] =
    useState<"redirect" | "pin" | "avs_noauth" | "otp" | "">("");

  const handleNext = () => setActiveStep((cur) => cur + 1);

  return (
    <div className="w-full">
      {activeStep === 0 && (
        <div className="my-10">
          <CardInput
            handleClick={handleNext}
            updateAuthorization={setValidateChargeAuthorization}
            plan={plan!}
          />
        </div>
      )}
      {activeStep === 1 && (
        <div className="my-10">
          {validateChargeAuthorization === "pin" && (
            <AnimatePresence
              key={`${validateChargeAuthorization} - ${activeStep}`}
            >
              <motion.div
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ y: -100 }}
                transition={{ duration: 0.33 }}
              >
                <AuthPinInput
                  handleClick={handleNext}
                  updateFinalAuthorization={setValidateChargeAuthorization}
                />
              </motion.div>
            </AnimatePresence>
          )}
          {validateChargeAuthorization === "avs_noauth" && (
            <AnimatePresence
              key={`${validateChargeAuthorization} - ${activeStep}`}
            >
              <motion.div
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ y: -100 }}
                transition={{ duration: 0.33 }}
              >
                <AvsNoauthInput
                  updateFinalAuthorization={setValidateChargeAuthorization}
                  handleClick={handleNext}
                />
              </motion.div>
            </AnimatePresence>
          )}
          {validateChargeAuthorization === "redirect" && (
            <>
              <AnimatePresence
                key={`${validateChargeAuthorization} - ${activeStep}`}
              >
                <motion.div
                  initial={{ x: 100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ y: -100 }}
                  transition={{ duration: 0.33 }}
                >
                  <div className="grid place-items-center">
                    <div className="flex flex-col space-y-3 justify-center items-center">
                      <Load />
                      <p className="text-[13px] text-center font-normal">
                        Redirecting you to a secure authentication portal <br />{" "}
                        Please wait...
                      </p>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </>
          )}
        </div>
      )}
      {activeStep === 2 && (
        <div className="my-10">
          {validateChargeAuthorization === "otp" && (
            <AnimatePresence
              key={`${validateChargeAuthorization} - ${activeStep}`}
            >
              <motion.div
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ y: -100 }}
                transition={{ duration: 0.33 }}
              >
                <OtpInput handleClick={handleNext} set_id={set_trans_id} />
              </motion.div>
            </AnimatePresence>
          )}
          {validateChargeAuthorization === "redirect" && (
            <>
              <AnimatePresence
                key={`${validateChargeAuthorization} - ${activeStep}`}
              >
                <motion.div
                  initial={{ x: 100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ y: -100 }}
                  transition={{ duration: 0.33 }}
                >
                  <div className="grid place-items-center">
                    <div className="flex flex-col space-y-3 justify-center items-center">
                      <Load />
                      <p className="text-[13px] text-center font-normal">
                        Redirecting you to a secure authentication portal <br />{" "}
                        Please wait...
                      </p>
                    </div>
                  </div>{" "}
                </motion.div>
              </AnimatePresence>
            </>
          )}
        </div>
      )}
      {activeStep === 3 && (
        <div className={` my-10`}>
          <AnimatePresence
            key={`${validateChargeAuthorization} - ${activeStep}`}
          >
            <motion.div
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ y: -100 }}
              transition={{ duration: 0.33 }}
            >
              <VerifyTransaction transaction_id={trans_id} />{" "}
            </motion.div>
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
