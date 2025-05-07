"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";

export default function MobileBlockScreen() {
  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth >= 768) {
      window.location.href = "/dashboard"; // Optional: redirect desktop users back
    }
  }, []);

  return (
    <main className="min-h-screen  text-dark w-full flex items-center justify-center px-6 py-10">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Logo (Optional) */}
        <Image
          src="https://fra.cloud.appwrite.io/v1/storage/buckets/66aa1aa0001a0c51d892/files/68028808001793765300/view?project=66aa198b0038ad614178&mode=admin"
          alt="Omenai Logo"
          width={120}
          height={40}
          className="mx-auto mb-4"
        />

        <h1 className="text-fluid-sm font-semibold">
          Omenai Dashboard isn’t available on mobile
        </h1>
        <p className="text-dark text-fluid-base">
          For the best experience managing your artworks, orders, and platform
          tools, please use a desktop or download our mobile app.
        </p>

        <ul className="text-left text-fluid-base text-dark space-y-2">
          <li>✅ Upload and manage artworks easily</li>
          <li>✅ Manage orders and track shipments</li>
          <li>✅ Withdraw funds securely</li>
          <li>✅ Get the premium Omenai experience</li>
        </ul>

        {/* App Store buttons */}
        <div className="flex flex-col w-full justify-center gap-4 pt-4">
          <Link
            href="https://play.google.com/store/apps/details?id=com.omenai.app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              src="/google_appstore.png"
              alt="Get it on Google Play"
              width={160}
              height={50}
            />
          </Link>
          <Link
            href="https://apps.apple.com/app/omenai/id1234567890"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              src="/apple_appstore.png"
              alt="Download on the App Store"
              width={160}
              height={50}
            />
          </Link>
        </div>

        {/* Optional animation or encouragement */}
        <p className="text-fluid-base text-dark pt-4">
          Already using a desktop? Try switching to a larger screen to continue.
        </p>
      </div>
    </main>
  );
}
