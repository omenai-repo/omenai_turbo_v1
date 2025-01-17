"use client";
import Image from "next/image";
import React from "react";
import { useLoginStore } from "@omenai/shared-state-store/src/auth/login/LoginStore";
import GalleryLoginForm from "./features/galleryForm/Form";
import IndividualLoginForm from "./features/individualForm/Form";
import LoginOptions from "./components/LoginOptions";
import { IndividualLogo } from "@omenai/shared-ui-components/components/logo/Logo";
import { AnimatePresence, motion } from "framer-motion";
import FormInput from "./features/galleryForm/components/FormInput";

function Page() {
  const { current } = useLoginStore();

  return (
    <section className="h-[100vh] w-full xl:container py-12 grid place-items-center overflow-x-hidden">
      <div className="w-full h-full md:grid grid-cols-2">
        {/* Side section */}
        <div className="h-full w-full relative flex-1 hidden md:block">
          <Image
            src={"/login_banner.png"}
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
                    Login & experience art.
                  </h1>
                </div>
                <LoginOptions />
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

export default Page;
