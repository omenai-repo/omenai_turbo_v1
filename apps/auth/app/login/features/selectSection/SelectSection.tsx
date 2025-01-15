"use client";
import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useLoginStore } from "@omenai/shared-state-store/src/auth/login/LoginStore";
import { auth_uri } from "@omenai/url-config/src/config";

function SelectSection() {
  const { updateCurrent } = useLoginStore();
  const auth_url = auth_uri();
  return (
    <AnimatePresence key={5}>
      <motion.div
        initial={{ x: -300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ y: 300 }}
        transition={{ duration: 0.33 }}
        className="max-w-[560px] py-[20px] md:py-[30px]"
      >
        <h1 className="text-2xl font-normal">Sign into your account</h1>
        <p className="text-[#616161] mt-2">Gain access to your account</p>
        <div className="flex flex-col gap-5 mt-[50px]">
          <div
            className="w-full border border-[#E0E0E0] bg-white rounded-md px-5 py-5 cursor-pointer"
            onClick={() => updateCurrent(1)}
          >
            <p className="text-base">As an individual</p>
            <p className="text-[14px] text-[#161616]">
              Purchase artworks and access your licenses and orders
            </p>
          </div>
          <div
            className="w-full border border-[#E0E0E0] bg-white rounded-md px-5 py-5 cursor-pointer"
            onClick={() => updateCurrent(2)}
          >
            <p className="text-base">As a gallery</p>
            <p className="text-[14px] text-[#161616]">
              Purchase artworks and access your licenses and orders
            </p>
          </div>
        </div>
        <p className="text-right text-[#161616] mt-10">
          Don’t have an account?{" "}
          <Link href={`${auth_url}/register/gallery`}>
            {" "}
            <span className="underline text-black font-normal">
              Create one
            </span>{" "}
          </Link>
        </p>
        <Link href={"/"}>
          <button className="h-[40px] px-4 w-full bg-black text-white cursor-pointer mt-[50px]">
            Go back home
          </button>
        </Link>
      </motion.div>
    </AnimatePresence>
  );
}

export default SelectSection;
