"use client";

import { DeepLinkPayload } from "@omenai/shared-types";

interface Props {
  data: DeepLinkPayload;
  rawToken: string;
}

export default function FallbackActions({ data, rawToken }: Props) {
  const handleOpenApp = () => {
    window.location.href = `omenai://${data.route}?token=${rawToken}`;
  };

  const handleContinueOnWeb = () => {
    const finalUrl = data.route;

    window.location.href = finalUrl;
  };

  return (
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
  );
}
