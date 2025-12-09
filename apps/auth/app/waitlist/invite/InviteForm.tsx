"use client";
import { INPUT_CLASS } from "@omenai/shared-ui-components/components/styles/inputClasses";
import Link from "next/link";
import React from "react";
import WaitlistFormLayout from "../WaitlistFormLayout";
import { auth_uri } from "@omenai/url-config/src/config";

export default function InviteForm({ entity }: Readonly<{ entity: string }>) {
  const auth_url = auth_uri();
  return (
    <WaitlistFormLayout
      title="Be the First to Experience Omenai"
      description="Already have an invite code? Enter it here to get instant access."
    >
      <form className="flex flex-col gap-y-5">
        <div className="flex flex-col">
          <input
            type={"email"}
            placeholder={
              entity === "gallery"
                ? "Enter the gallery email address"
                : "Enter your email address"
            }
            required
            className={INPUT_CLASS}
          />
        </div>

        <div className="flex flex-col">
          <input
            type={"text"}
            placeholder={
              entity === "gallery"
                ? "Enter the gallery invite code"
                : "Enter your invite code"
            }
            className={INPUT_CLASS}
            required
          />
        </div>
        <p className="font-medium text-fluid-xxs  text-right text-dark ">
          <Link
            href={`${auth_url}/waitlist?entity=${entity}`}
            className="text-dark hover:underline"
          >
            I don't have an invite code
          </Link>
        </p>

        <div className="flex flex-col w-full gap-y-4">
          <button
            type="submit"
            className=" p-4 rounded-full w-full flex items-center justify-center gap-3 disabled:cursor-not-allowed disabled:bg-dark/10 disabled:text-[#A1A1A1] bg-dark text-white text-fluid-xxs font-medium"
          >
            Continue
          </button>
        </div>
      </form>
    </WaitlistFormLayout>
  );
}
