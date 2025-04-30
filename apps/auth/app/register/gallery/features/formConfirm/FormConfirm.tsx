"use client";
import { useGalleryAuthStore } from "@omenai/shared-state-store/src/auth/register/GalleryAuthStore";
import { motion } from "framer-motion";
import Link from "next/link";
import { ChangeEvent, useState } from "react";
import { LoadSmall } from "@omenai/shared-ui-components/components/loader/Load";
import { Checkbox, Label } from "flowbite-react";

export default function FormConfirm() {
  const { decrementCurrentGallerySignupFormIndex, isLoading } =
    useGalleryAuthStore();
  const [isConsentChecked, setIsConcentChecked] = useState(false);
  return (
    <motion.div
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ y: -100 }}
      transition={{ duration: 0.33 }}
    >
      {/* <h1 className="text-fluid-xxs sm:text-fluid-base font-semibold mb-4">
        Confirm account creation
      </h1> */}
      <p className="text-fluid-xxs my-4 font-normal">
        Please read through and confirm that you understand and accept all the
        terms stated
      </p>

      <div className="bg-[#FAFAFA] p-2 my-5 flex flex-col gap-y-5">
        <div className="flex items-center gap-2">
          <Checkbox
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setIsConcentChecked(e.target.checked)
            }
            id="terms of use"
            required
            className="border-dark"
          />
          <Label
            htmlFor="terms of use"
            className="text-dark text-fluid-xxs sm:text-fluid-xs"
          >
            By ticking this box, I accept the{" "}
            <Link href={"/"} className="underline font-bold">
              Terms of use
            </Link>{" "}
            and{" "}
            <Link href={"/"} className="underline font-bold">
              Privacy Policy
            </Link>{" "}
            of creating an account with Omenai Inc.
          </Label>
        </div>
      </div>

      <div className="flex flex-col space-y-5 mt-8">
        <button
          type="submit"
          disabled={isLoading || !isConsentChecked}
          className="bg-dark hover:bg-dark/80 text-white border-0 ring-dark/20  duration-300 outline-none focus:outline-none disabled:bg-dark/10 disabled:cursor-not-allowed disabled:text-white rounded-full h-[35px] p-5 w-full text-center text-fluid-xs flex items-center justify-center hover:ring-white cursor-pointer"
        >
          {isLoading ? <LoadSmall /> : "Create account"}
        </button>
        <button
          disabled={isLoading}
          className={` bg-white  text-dark focus:ring ring-1 border-0 ring-dark/50 focus:ring-dark duration-300 outline-none focus:outline-none disabled:bg-dark/10 disabled:text-white rounded-full h-[35px] p-5 w-full text-center text-fluid-xs flex items-center justify-center hover:ring-dark cursor-pointer`}
          type={"button"}
          onClick={decrementCurrentGallerySignupFormIndex}
        >
          Back
        </button>
      </div>
    </motion.div>
  );
}
