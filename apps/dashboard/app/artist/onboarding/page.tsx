"use client";
import {
  BriefcaseIcon,
  AcademicCapIcon,
  BuildingLibraryIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/solid";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { toast_notif } from "@omenai/shared-utils/src/toast_notification";
import { IndividualLogo } from "@omenai/shared-ui-components/components/logo/Logo";

import Link from "next/link";

export default function ArtistOnboarding() {
  const { signOut } = useAuth({ requiredRole: "artist" });
  const handleSignOut = async () => {
    await signOut();
    toast_notif("Signing you out... please wait", "info");
  };
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-gray-100">
      <div
        className="absolute inset-0 z-0 opacity-90"
        style={{
          // Uses a subtle CSS background image for the dot mesh effect
          backgroundImage: `radial-gradient(circle, #d4d4d4 1px, transparent 1px)`,
          backgroundSize: "20px 20px",
        }}
      />
      <div className="relatiev z-10 bg-white shadow-xl rounded p-8 max-w-lg">
        <div className="w-ful my-5">
          <IndividualLogo />
        </div>

        <h1 className="text-fluid-md font-bold text-gray-900">
          One last step before you begin… 🎨✨
        </h1>
        <p className="text-gray-600 mt-3 text-fluid-xxs">
          To ensure a high standard of artistry and credibility on our platform,
          we need to learn more about your artistic journey.
        </p>

        <div className="mt-6 space-y-3 text-fluid-xxs text-left">
          <div className="flex items-center space-x-3">
            <BriefcaseIcon className="w-6 h-6 text-blue-600" />
            <span className="text-dark">Your art style and background</span>
          </div>
          <div className="flex items-center space-x-3">
            <AcademicCapIcon className="w-6 h-6 text-green-600" />
            <span className="text-dark">Your education and exhibitions</span>
          </div>
          <div className="flex items-center space-x-3">
            <BuildingLibraryIcon className="w-6 h-6 text-purple-600" />
            <span className="text-dark">
              Museum collections featuring your work
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <DocumentTextIcon className="w-6 h-6 text-red-600" />
            <span className="text-dark">Your CV and credentials</span>
          </div>

          <div className="my-5">
            <p className="text-gray-600 mt-3 text-fluid-xxs">
              Once submitted, our team will review your information and verify
              your profile. After approval, you&apos;ll gain full access to
              showcase and sell your work to collectors worldwide. Your data
              will remain confidential and used solely for this purpose.
            </p>
          </div>

          <div className="mt-8 space-y-3">
            <Link href={"/artist/onboarding/flow"}>
              <button className="w-full bg-dark text-fluid-xxs hover:bg-dark/70 text-white py-3 rounded font-semibold transition">
                Start onboarding process
              </button>
            </Link>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="bg-dark absolute top-6 right-6 hover:bg-dark/80 disabled:cursor-not-allowed text-white focus:ring ring-1 border-0 ring-dark/20 focus:ring-white duration-300 outline-none focus:outline-none disabled:bg-dark/10 disabled:text-white rounded h-[35px] p-5 w-fit text-center text-fluid-xxs flex items-center justify-center hover:ring-white cursor-pointer"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
