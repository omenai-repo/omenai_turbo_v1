"use client";
import { FaApple, FaGooglePlay } from "react-icons/fa";

import { DeepLinkPayload } from "@omenai/shared-types";

interface Props {
  data: DeepLinkPayload;
  rawToken: string;
}

export default function FallbackActions({ data, rawToken }: Props) {
  const handleOpenApp = () => {
    window.location.href = `omenaimobile://dl?token=${rawToken}`;
  };

  const handleContinueOnWeb = () => {
    const finalUrl = data.route;
    window.location.href = finalUrl;
  };

  return (
    <div className="flex flex-col w-full">
      {/* Primary Actions */}
      <div className="flex flex-col gap-3 w-full">
        <button
          onClick={handleOpenApp}
          className="w-full rounded-md bg-zinc-900 px-4 py-3.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
        >
          Open in App
        </button>

        <button
          onClick={handleContinueOnWeb}
          className="w-full rounded-md border border-zinc-200 bg-white px-4 py-3.5 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50"
        >
          Continue on Web
        </button>
      </div>

      <div className="mt-8 flex flex-col items-center border-t border-zinc-100 pt-6">
        <p className="text-sm text-zinc-500 mb-4">Don't have the Omenai app?</p>

        <div className="flex w-full gap-3">
          <a
            href="https://apps.apple.com/ng/app/omenai/id6748387089"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 w-full rounded bg-white border border-neutral-200 px-4 py-3 hover:border-[#091830] hover:shadow-md transition-all duration-300"
          >
            <FaApple className="text-xl text-dark " />
            <div className="flex flex-col">
              <span className="text-[9px] font-bold uppercase text-neutral-400 leading-none">
                Download on the
              </span>
              <span className="text-xs font-bold text-dark  leading-tight">
                App Store
              </span>
            </div>
          </a>

          <a
            href="https://play.google.com/store/apps/details?id=com.omenai.omenaiapp"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 w-full rounded bg-white border border-neutral-200 px-4 py-3 hover:border-[#091830] hover:shadow-md transition-all duration-300"
          >
            <FaGooglePlay className="text-lg text-dark " />
            <div className="flex flex-col">
              <span className="text-[9px] font-bold uppercase text-neutral-400 leading-none">
                Get it on
              </span>
              <span className="text-xs font-bold text-dark  leading-tight">
                Google Play
              </span>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
