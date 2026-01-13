// components/profile/ProfileAvatar.tsx
import React from "react";

export default function ProfileAvatar({
  name,
  verified,
}: {
  name: string;
  verified: boolean;
}) {
  const getInitials = (n: string) => {
    const parts = n.split(" ");
    return parts.length > 1
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`
      : n.substring(0, 2);
  };

  return (
    <div className="relative inline-block">
      <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-slate-900 text-white flex items-center justify-center text-2xl md:text-4xl font-light tracking-widest shadow-xl shadow-slate-200 ring-4 ring-white">
        {getInitials(name).toUpperCase()}
      </div>
      {verified && (
        <div className="absolute bottom-1 right-1 md:bottom-2 md:right-2 bg-white p-1.5 rounded-full shadow-sm">
          <div className="bg-green-500 rounded-full p-1">
            <svg
              className="w-3 h-3 md:w-4 md:h-4 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}
