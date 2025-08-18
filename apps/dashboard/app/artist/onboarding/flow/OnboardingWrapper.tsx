"use client";
import EmblaCarousel from "./Carousel";
import { IndividualLogo } from "@omenai/shared-ui-components/components/logo/Logo";
import "react-tooltip/dist/react-tooltip.css";
import { Tooltip } from "react-tooltip";
import { toast } from "sonner";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { toast_notif } from "@omenai/shared-utils/src/toast_notification";

export default function OnboardingFlow() {
  const { signOut } = useAuth({ requiredRole: "artist" });

  const handleSignOut = async () => {
    await signOut();
    toast_notif("Signing you out... please wait", "info");
  };

  return (
    <div className=" px-5">
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-y-3 mt-8">
          <IndividualLogo />
          <p className="text-fluid-sm font-medium">Artist Onboarding</p>
          <span className="text-fluid-xs font-light">
            Fill in the required details below to complete your onboarding
            session
          </span>
        </div>
        {/* Logout button */}
        <button
          onClick={handleSignOut}
          className="bg-dark hover:bg-dark/80 disabled:cursor-not-allowed text-white focus:ring ring-1 border-0 ring-dark/20 focus:ring-white duration-300 outline-none focus:outline-none disabled:bg-dark/10 disabled:text-white rounded-xl h-[35px] p-5 w-fit text-center text-fluid-xs flex items-center justify-center hover:ring-white cursor-pointer"
        >
          Logout
        </button>
      </div>

      <div className="min-h-[85svh] relative w-full flex items-center justify-center">
        <EmblaCarousel />
        <div className="absolute bottom-10 left-0 ml-[5rem]">
          <div
            data-tooltip-id="onboarding-help"
            data-tooltip-content="Before you start showcasing your work, we need to confirm your artistic background."
            data-tooltip-place="top"
            id="onboarding-help"
            className="w-12 h-12 bg-dark rounded-xl grid place-items-center hover:cursor-pointer"
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
