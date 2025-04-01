"use client";
import React from "react";
import EmblaCarousel from "./Carousel";
import { IndividualLogo } from "@omenai/shared-ui-components/components/logo/Logo";
import "react-tooltip/dist/react-tooltip.css";
import { Tooltip } from "react-tooltip";
import { signOut } from "@omenai/shared-services/auth/session/deleteSession";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { auth_uri } from "@omenai/url-config/src/config";
export default function OnboardingFlow() {
  const auth_url = auth_uri();
  const router = useRouter();
  async function handleSignout() {
    toast.info("Signing you out...");
    const res = await signOut();

    if (res.isOk) {
      toast.info("Operation successful", {
        description: "Successfully signed out...redirecting",
      });
      router.replace(`${auth_url}/login`);
    } else {
      toast.error("Operation successful", {
        description:
          "Something went wrong, please try again or contact support",
      });
    }
  }
  return (
    <div className="container p-5">
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-y-3 mt-8">
          <IndividualLogo />
          <p className="text-sm font-medium">Artist Onboarding</p>
          <span className="text-[14px] font-light">
            Fill in the required details below to complete your onboarding
            session
          </span>
        </div>
        {/* Logout button */}
        <button
          onClick={handleSignout}
          className="bg-dark hover:bg-dark/80 disabled:cursor-not-allowed text-white focus:ring ring-1 border-0 ring-dark/20 focus:ring-white duration-300 outline-none focus:outline-none disabled:bg-dark/10 disabled:text-white rounded-full h-[40px] p-6 w-fit text-center text-[14px] flex items-center justify-center hover:ring-white cursor-pointer"
        >
          Logout
        </button>
      </div>

      <div className="min-h-[85svh] relative w-full flex items-center justify-center">
        <EmblaCarousel />
        <div className="absolute bottom-0 left-0 ml-[5rem]">
          <div
            data-tooltip-id="onboarding-help"
            data-tooltip-content="Before you start showcasing your work, we need to confirm your artistic background."
            data-tooltip-place="top"
            id="onboarding-help"
            className="w-12 h-12 bg-dark rounded-full grid place-items-center hover:cursor-pointer"
          >
            <span className="text-white">?</span>
          </div>
          <Tooltip
            id="onboarding-help"
            style={{
              backgroundColor: "#030303",
              color: "white",
              fontSize: "13px",
            }}
          />
        </div>
      </div>
    </div>
  );
}
