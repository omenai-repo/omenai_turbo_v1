"use client";

import Image from "next/image";

export default function MobileBlockScreen() {
  return (
    <main className="min-h-screen bg-white text-dark flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-md text-center space-y-8">
        {/* Logo */}
        <div className="flex justify-center">
          <Image
            src="https://fra.cloud.appwrite.io/v1/storage/buckets/68d2931900387c9110e6/files/696ee3b60025e2a2c4ff/view?project=682272b1001e9d1609a8"
            alt="Omenai Logo"
            width={120}
            height={40}
            priority
          />
        </div>

        {/* Content Card */}
        <div className="bg-gray-50 rounded-2xl p-6 shadow-sm space-y-4">
          <h1 className="text-lg font-semibold leading-snug">
            Desktop Only Experience
          </h1>

          <p className="text-sm text-gray-600 leading-relaxed">
            The Omenai Admin Dashboard isn’t available on mobile or tablet yet.
            To manage artworks, orders, and platform tools, please switch to a
            desktop device.
          </p>

          {/* Hint / Tip */}
          <div className="pt-2 text-xs text-gray-500">
            Already on desktop? Try resizing your browser or switching to a
            larger screen.
          </div>
        </div>
      </div>
    </main>
  );
}
