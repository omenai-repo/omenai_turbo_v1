"use client";
import { IndividualLogo } from "@omenai/shared-ui-components/components/logo/Logo";
import { auth_uri } from "@omenai/url-config/src/config";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import React from "react";

export default function WaitlistFormLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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

            {children}
          </div>
          <div className="flex flex-col gap-y-2 my-6 justify-between items-center">
            <div className="flex gap-x-6">
              <p className="font-medium text-fluid-xxs text-dark ">
                <Link href={`${auth_url}/register/user`} className="text-dark">
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
      </motion.div>
    </AnimatePresence>
  );
}
