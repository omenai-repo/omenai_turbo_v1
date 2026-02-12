"use client";
import { useIndividualAuthStore } from "@omenai/shared-state-store/src/auth/register/IndividualAuthStore";
import { LoadSmall } from "@omenai/shared-ui-components/components/loader/Load";
import { base_url } from "@omenai/url-config/src/config";
import { Checkbox, Label } from "flowbite-react";
import { motion } from "framer-motion";
import Link from "next/link";
import React, { ChangeEvent, useState } from "react";

export default function TC() {
  const { decrementCurrentSignupFormIndex, preferences, isLoading } =
    useIndividualAuthStore();
  const [isChecked, setIsChecked] = useState(false);
  return (
    <motion.div
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ y: -100 }}
      transition={{ duration: 0.33 }}
    >
      <p className="text-fluid-xxs my-4 font-light">
        Please read through and confirm that you understand and accept all the
        terms stated
      </p>

      <div className="bg-[#FAFAFA] p-2 my-5 flex flex-col gap-y-5">
        <div className="flex items-center gap-2">
          <Checkbox
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setIsChecked(e.target.checked)
            }
            id="terms of use"
            required
            className="border-dark"
          />
          <Label
            htmlFor="policy-acceptance"
            className="text-dark/80 text-fluid-xxs font-light cursor-pointer"
          >
            I accept Omenai's{" "}
            <Link
              href={`${base_url()}/legal?ent=collector`}
              target="__blank"
              className="underline font-medium text-dark"
            >
              Terms of Use
            </Link>{" "}
            and{" "}
            <Link
              href={`${base_url()}/privacy`}
              target="__blank"
              className="underline font-medium text-dark"
            >
              Privacy Policy
            </Link>
          </Label>
        </div>
      </div>

      <div className="flex gap-x-4 items-center">
        <button
          disabled={isLoading}
          className={`border border-slate-400   bg-transparent text-dark hover:border-slate-800 disabled:cursor-not-allowed focus:ring-0 duration-300 outline-none focus:outline-none disabled:bg-dark/5 disabled:text-white disabled:border-0 rounded h-[35px] p-5 w-full text-center text-fluid-xxs flex items-center justify-center hover:ring-white cursor-pointer`}
          type={"button"}
          onClick={decrementCurrentSignupFormIndex}
        >
          Back
        </button>
        <button
          type="submit"
          disabled={isLoading || !isChecked}
          className="bg-dark hover:bg-dark/80 text-white border-0 ring-dark/20  duration-300 outline-none focus:outline-none disabled:bg-dark/10 disabled:cursor-not-allowed disabled:text-white rounded h-[35px] p-5 w-full text-center text-fluid-xxs flex items-center justify-center hover:ring-white cursor-pointer"
        >
          {isLoading ? <LoadSmall /> : "Create account"}
        </button>
      </div>
    </motion.div>
  );
}
