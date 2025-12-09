"use client";
import { INPUT_CLASS } from "@omenai/shared-ui-components/components/styles/inputClasses";
import { auth_uri } from "@omenai/url-config/src/config";
import Link from "next/link";
import React from "react";
import WaitlistFormLayout from "./WaitlistFormLayout";

export default function WaitlistForm() {
  const auth_url = auth_uri();
  return (
    <WaitlistFormLayout>
      <form className="flex flex-col gap-y-5">
        <div className="flex flex-col">
          <input
            type={"email"}
            placeholder={"Enter the gallery email address"}
            required
            className={INPUT_CLASS}
          />
        </div>

        <div className="flex flex-col">
          <input
            type={"text"}
            placeholder={"Enter the gallery invite code"}
            className={INPUT_CLASS}
            required
          />
        </div>
        <p className="font-medium text-fluid-xxs  text-right text-dark ">
          <Link
            href={`${auth_url}/register/gallery/waitlist/get-code`}
            className="text-dark hover:underline"
          >
            I don't have an invite code
          </Link>
        </p>

        <div className="flex flex-col mt-[1rem] gap-4 w-full">
          <div className="flex flex-col w-full gap-y-4">
            <button
              type="submit"
              className=" p-4 rounded-full w-full flex items-center justify-center gap-3 disabled:cursor-not-allowed disabled:bg-dark/10 disabled:text-[#A1A1A1] bg-dark text-white text-fluid-xxs font-medium"
            >
              Continue
            </button>
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
      </form>
    </WaitlistFormLayout>
  );
}
