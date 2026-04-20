// components/programming/VipLinkManager.tsx
"use client";

import React, { useState } from "react";
import { toast_notif } from "@omenai/shared-utils/src/toast_notification";
import { manageVipToken } from "@omenai/shared-services/gallery/events/manageVipToken";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { base_url } from "@omenai/url-config/src/config";

export const VipLinkManager = ({ event }: { event: any }) => {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  const { csrf } = useAuth({ requiredRole: "gallery" });

  const handleTokenAction = async (action: "generate" | "revoke") => {
    setIsLoading(true);
    const res = await manageVipToken(
      event.event_id,
      event.gallery_id,
      action,
      csrf || "",
    );

    if (res.isOk) {
      toast_notif(res.message, "success");
      queryClient.invalidateQueries({
        queryKey: ["eventDashboard", event.event_id],
      });
    } else {
      toast_notif(res.message, "error");
    }
    setIsLoading(false);
  };

  const copyToClipboard = () => {
    // Dynamically grab the current domain so this works in local dev and production
    const origin = base_url();
    const link = `${origin}/shows/${event.event_id}?vip=${event.vip_access_token}`;

    navigator.clipboard.writeText(link);
    toast_notif("VIP Link copied to clipboard", "success");
  };

  return (
    <div className="w-full bg-white border border-neutral-200 rounded-sm p-6 shadow-sm mt-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-medium text-dark flex items-center gap-2">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4v-5.414l9.257-9.257a6 6 0 115.743 5.743z"
              />
            </svg>
            VIP Early Access Link
          </h3>
          <p className="text-xs text-neutral-500 tracking-wide mt-1">
            Generate a private link to bypass the opening date restriction for
            top collectors.
          </p>
        </div>

        {!event.vip_access_token ? (
          <button
            onClick={() => handleTokenAction("generate")}
            disabled={isLoading}
            className="px-6 py-2.5 text-xs font-medium tracking-widest uppercase bg-dark text-white hover:bg-neutral-800 transition-colors rounded-sm disabled:opacity-50 shrink-0"
          >
            {isLoading ? "Generating..." : "Generate Link"}
          </button>
        ) : (
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="bg-neutral-50 border border-neutral-200 px-4 py-2 text-xs text-neutral-500 font-mono truncate w-full md:w-64 rounded-sm">
              .../shows/{event.event_id}?vip=
              {event.vip_access_token.substring(0, 8)}...
            </div>
            <button
              onClick={copyToClipboard}
              className="p-2.5 bg-white border border-neutral-200 text-dark hover:border-dark transition-colors rounded-sm"
              title="Copy full link"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            </button>
            <button
              onClick={() => handleTokenAction("revoke")}
              disabled={isLoading}
              className="p-2.5 bg-white border border-red-200 text-red-500 hover:bg-red-50 transition-colors rounded-sm"
              title="Revoke access"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
