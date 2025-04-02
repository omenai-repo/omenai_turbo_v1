import {
  BriefcaseIcon,
  AcademicCapIcon,
  BuildingLibraryIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/solid";

import { IndividualLogo } from "@omenai/shared-ui-components/components/logo/Logo";

import Link from "next/link";

export default function ArtistOnboarding() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-xl rounded-2xl p-8 max-w-lg">
        <div className="w-ful my-5">
          <IndividualLogo />
        </div>

        <h1 className="text-md font-bold text-gray-900">
          One last step before you begin… 🎨✨
        </h1>
        <p className="text-gray-600 mt-3 text-xs">
          To ensure a high standard of artistry and credibility on our platform,
          we need to learn more about your artistic journey.
        </p>

        <div className="mt-6 space-y-3 text-xs text-left">
          <div className="flex items-center space-x-3">
            <BriefcaseIcon className="w-6 h-6 text-blue-600" />
            <span className="text-gray-700">Your art style and background</span>
          </div>
          <div className="flex items-center space-x-3">
            <AcademicCapIcon className="w-6 h-6 text-green-600" />
            <span className="text-gray-700">
              Your education and exhibitions
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <BuildingLibraryIcon className="w-6 h-6 text-purple-600" />
            <span className="text-gray-700">
              Museum collections featuring your work
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <DocumentTextIcon className="w-6 h-6 text-red-600" />
            <span className="text-gray-700">Your CV and credentials</span>
          </div>
        </div>

        <div className="my-5">
          <p className="text-gray-600 mt-3 text-xs">
            Once submitted, our team will review your information and verify
            your profile. After approval, you&apos;ll gain full access to
            showcase and sell your work to collectors worldwide. Your data will
            remain confidential and used solely for this purpose.
          </p>
        </div>

        <div className="mt-8 space-y-3">
          <Link href={"/artist/onboarding/flow"}>
            <button className="w-full bg-dark text-xs hover:bg-dark/70 text-white py-3 rounded-full font-semibold transition">
              Start onboarding process
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
