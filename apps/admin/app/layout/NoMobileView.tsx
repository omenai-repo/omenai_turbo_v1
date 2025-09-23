"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";

export default function MobileBlockScreen() {
  return (
    <main className="min-h-screen  text-dark w-full flex items-center justify-center px-6 py-10">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Logo (Optional) */}
        <Image
          src="https://fra.cloud.appwrite.io/v1/storage/buckets/68d2931900387c9110e6/files/68d2ab83002025087b36/view?project=682272b1001e9d1609a8"
          alt="Omenai Logo"
          width={120}
          height={40}
          className="mx-auto mb-4"
        />

        <h1 className="text-fluid-sm font-semibold">
          Omenai Admin Dashboard isn’t available on mobile or Tablet
        </h1>
        <p className="text-dark text-fluid-base">
          For the best experience managing your artworks, orders, and platform
          tools, please use a desktop
        </p>
      </div>

      {/* Optional animation or encouragement */}
      <p className="text-fluid-base text-dark pt-4">
        Already using a desktop? Try switching to a larger screen to continue.
      </p>
    </main>
  );
}
