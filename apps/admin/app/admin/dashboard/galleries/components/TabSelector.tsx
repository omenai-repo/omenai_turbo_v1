import React from "react";

export default function TabSelector({
  tab,
  setTab,
}: {
  tab: any;
  setTab: any;
}) {
  return (
    <div className="p-2 rounded-sm flex gap-2 bg-white ring-1 ring-dark/20 w-fit max-w-full">
      {/* User */}
      <div
        className={`h-[35px] px-4 rounded-sm cursor-pointer w-fit grid place-items-center text-[14px] ${
          tab === "pending"
            ? "bg-dark  text-white"
            : "bg-transparent text-gray-700"
        }  cursor-pointer rounded-sm `}
        onClick={() => setTab("pending")}
      >
        <p>Pending verifications</p>
      </div>
      {/* Gallery */}
      <div
        className={`h-[35px] px-4 rounded-sm cursor-pointer w-fit grid text-[14px] place-items-center ${
          tab === "verified"
            ? "bg-dark  text-white"
            : "bg-transparent text-gray-700"
        }  cursor-pointer rounded-sm `}
        onClick={() => setTab("verified")}
      >
        <p>Verified Galleries</p>
      </div>
    </div>
  );
}
