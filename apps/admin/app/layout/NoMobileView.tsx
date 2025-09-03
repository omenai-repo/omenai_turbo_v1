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
          src="https://fra.cloud.appwrite.io/v1/storage/buckets/68227462000f77619b04/files/68b8ccd6000dedf704d5/view?project=682273fc00235a5bdb6c"
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
