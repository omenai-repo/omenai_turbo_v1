"use client";
import { IndividualLogo } from "@omenai/shared-ui-components/components/logo/Logo";
import { INPUT_CLASS } from "@omenai/shared-ui-components/components/styles/inputClasses";
import { auth_uri } from "@omenai/url-config/src/config";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import React from "react";

export default function GetCodeForm() {
  const auth_url = auth_uri();
  return (
    <AnimatePresence key={4}>
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ y: 100 }}
        transition={{ duration: 0.33 }}
        className="w-full h-full flex items-center gap-x-8 bg-white"
      >
        <div className="flex flex-col space-y-8 w-full ">
          <div className="text-fluid-xxs ">
            <IndividualLogo />
          </div>
          <div className="flex flex-col space-y-10 w-full">
            <h1 className="text-fluid-base sm:text-fluid-sm font-bold">
              Create a gallery Account
            </h1>

            <form className="flex flex-col gap-y-5">
              <div className="flex flex-col">
                <input
                  type={"text"}
                  placeholder={"Enter the gallery name"}
                  required
                  className={INPUT_CLASS}
                />
              </div>

              <div className="flex flex-col">
                <input
                  type={"email"}
                  placeholder={"Enter the gallery email address"}
                  className={INPUT_CLASS}
                  required
                />
              </div>
              <p className="font-medium text-fluid-xxs  text-right text-dark ">
                <Link
                  href={`${auth_url}/register/gallery/waitlist`}
                  className="text-dark hover:underline"
                >
                  I have an invite code
                </Link>
              </p>

              <div className="flex flex-col mt-[1rem] gap-4 w-full">
                <div className="flex flex-col w-full gap-y-4">
                  <button
                    type="submit"
                    className=" p-4 rounded-full w-full flex items-center justify-center gap-3 disabled:cursor-not-allowed disabled:bg-dark/10 disabled:text-[#A1A1A1] bg-dark text-white text-fluid-xxs font-medium"
                  >
                    Get invitation code
                  </button>
                </div>

                <div className="flex flex-col gap-y-2 my-6 justify-between items-center">
                  <div className="flex gap-x-6">
                    <p className="font-medium text-fluid-xxs text-dark ">
                      <Link
                        href={`${auth_url}/register/user`}
                        className="text-dark"
                      >
                        Sign up as Collector{" "}
                      </Link>
                    </p>
                    <p className="font-medium text-fluid-xxs text-dark">
                      <Link
                        href={`${auth_url}/register/artist`}
                        className="text-dark"
                      >
                        Sign up as Artist{" "}
                      </Link>
                    </p>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
