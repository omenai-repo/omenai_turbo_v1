"use client";
import Image from "next/image";

import { IndividualLogo } from "@omenai/shared-ui-components/components/logo/Logo";
import { AnimatePresence, motion } from "framer-motion";
import RegisterOptions from "./components/RegisterOptions";

function Page() {
  return (
    <section className="h-[100vh] w-full xl:container py-12  overflow-x-hidden">
      <div className="w-full h-full md:grid grid-cols-2">
        {/* Side section */}
        <div className="h-full w-full relative flex-1 hidden md:block">
          <Image
            src={"/gallery__banner.png"}
            alt="Individual sign up image block"
            width={960}
            height={1024}
            className="absolute inset-0 w-full rounded-[20px] h-full object-center object-cover"
          />
        </div>

        {/* Login options section */}

        <AnimatePresence key={94}>
          <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ y: 100 }}
            transition={{ duration: 0.33 }}
            className="w-full h-full flex items-center justify-center gap-x-8"
          >
            <div className="flex flex-col space-y-8 w-full ">
              <div className="w-full h-full flex flex-col gap-y-8 p-5 md:px-[50px] overflow-x-hidden">
                <div className="flex flex-col space-y-6">
                  <IndividualLogo />
                  <h1 className="text-sm sm:text-lg font-bold">
                    Create an account today.
                  </h1>
                </div>
                <RegisterOptions />
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

export default Page;
