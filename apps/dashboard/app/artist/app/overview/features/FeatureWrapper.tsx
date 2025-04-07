import React from "react";

export default function FeatureWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="p-5 rounded-[20px] bg-white w-full h-full">{children}</div>
  );
}
