"use client";
import React from "react";
import NavigationBar from "./NavigationBar";
import { Tooltip } from "react-tooltip";
import { artistActionStore } from "@omenai/shared-state-store/src/artist/actions/ActionStore";
export default function MainAppSection({
  children,
}: {
  children: React.ReactNode;
}) {
  const { toggle_artist_sidebar, artist_sidebar } = artistActionStore();
  return (
    <section className="flex gap-x-4 min-h-[calc(100svh-4.5rem)] h-[calc(100svh-4.5rem)] w-full">
      <div
        className={`${artist_sidebar ? "w-fit max-w-auto" : " max-w-[350px] w-[350px] "} duration-200 flex flex-col h-full p-3`}
      >
        {/* <div
          className={`${artist_sidebar ? "justify-center" : "justify-end"} w-full mb-4 flex duration-200 items-center`}
        >
          {artist_sidebar ? (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 28 28"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-6"
                onClick={toggle_artist_sidebar}
                data-tooltip-id="toggle-sidebar"
                data-tooltip-content="Toggle sidebar"
                data-tooltip-place="left"
                id="toggle-sidebar"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m5.25 4.5 7.5 7.5-7.5 7.5m6-15 7.5 7.5-7.5 7.5"
                />
              </svg>
            </>
          ) : (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 28 28"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-6"
                onClick={toggle_artist_sidebar}
                data-tooltip-id="toggle-sidebar"
                data-tooltip-content="Toggle sidebar"
                data-tooltip-place="left"
                id="toggle-sidebar"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m18.75 4.5-7.5 7.5 7.5 7.5m-6-15L5.25 12l7.5 7.5"
                />
              </svg>
            </>
          )}

          <Tooltip
            id="toggle-sidebar"
            style={{
              backgroundColor: "#111111",
              color: "white",
              fontSize: "13px",
              borderRadius: "10px",
            }}
          />
        </div> */}
        <NavigationBar />
      </div>
      <div className="w-full h-full">{children}</div>
    </section>
  );
}
