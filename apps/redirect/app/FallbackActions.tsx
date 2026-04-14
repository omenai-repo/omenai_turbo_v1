// app/FallbackActions.tsx (Client Component)
"use client";

import { DeepLinkPayload } from "@omenai/shared-types";

interface Props {
  data: DeepLinkPayload;
  rawToken: string;
}

export default function FallbackActions({ data, rawToken }: Props) {
  const handleOpenApp = () => {
    // Triggers the custom URI scheme (e.g., omenai://)
    // We pass the raw encrypted token so the mobile app's interceptor
    // can securely verify and process it via an API call to your backend.
    window.location.href = `omenai://${data.route}?token=${rawToken}`;
  };

  const handleContinueOnWeb = () => {
    // Reconstruct the full web URL
    const baseUrl = "https://omenai.app";

    // Convert the params object into a standard URL query string
    const queryParams = new URLSearchParams(data.params).toString();

    // Construct the final URL (e.g., https://omenai.app/payment?artworkId=123)
    const finalUrl = `${baseUrl}/${data.route}${queryParams ? `?${queryParams}` : ""}`;

    // Execute the web redirect
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
