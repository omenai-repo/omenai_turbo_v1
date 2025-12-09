import React from "react";
import WaitlistSuccessContent from "./WaitlistSuccessContent";

export default function WaitListSuccessPage() {
  return (
    <div className="relative flex flex-col gap-12 items-center p-4 lg:p-12 h-full">
      <div
        className="absolute inset-0 z-0 opacity-70"
        style={{
          // Uses a subtle CSS background image for the dot mesh effect
          backgroundImage: `radial-gradient(circle, #d4d4d4 1px, transparent 1px)`,
          backgroundSize: "20px 20px",
        }}
      />
      <WaitlistSuccessContent />
    </div>
  );
}
