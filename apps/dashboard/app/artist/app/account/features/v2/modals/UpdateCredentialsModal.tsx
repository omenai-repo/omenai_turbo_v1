import { AnimatePresence } from "framer-motion";
import React, { Dispatch, SetStateAction } from "react";
import { motion } from "framer-motion";
type Props = { setShowVerificationModal: Dispatch<SetStateAction<boolean>> };

export default function UpdateCredentialsModal({
  setShowVerificationModal,
}: Props) {
  return (
    <AnimatePresence key={13}>
      {/* {passwordModalPopup && ( */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => {
          setShowVerificationModal(false);
        }}
        className="bg-slate-900/20 backdrop-blur p-2 fixed inset-0 z-50 grid place-items-center cursor-pointer"
      >
        <motion.div
          initial={{ scale: 0, rotate: "12.5deg" }}
          animate={{ scale: 1, rotate: "0deg" }}
          exit={{ scale: 0, rotate: "0deg" }}
          onClick={(e) => e.stopPropagation()}
          className=" text-dark p-6 rounded w-full max-w-lg cursor-default relative h-auto"
        >
          {/* Add modal form here */}
          <div className="h-auto w-full">
            <div className="w-full overflow-y-auto max-h-[90vh] scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600">
              {/* Design 1: Clean Card with Progress */}
              <div className=" rounded shadow-lg border border-slate-200 overflow-hidden">
                {/* Header */}
                <div className="bg-slate-50 px-6 py-5 border-b border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-900 rounded">
                      <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h1 className="text-lg font-semibold text-slate-900">
                        Update Credentials
                      </h1>
                      {/* <p className="text-fluid-xxs text-slate-600">
                        Secure your account with a new password
                      </p> */}
                    </div>
                  </div>
                </div>

                {/* Form Content */}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
      {/* )} */}
    </AnimatePresence>
  );
}
