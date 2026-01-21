"use client";

import Image from "next/image";
import Link from "next/link";

export default function MobileBlockScreen() {
  return (
    <main className="min-h-screen w-full flex items-center justify-center px-6 py-12 bg-background text-dark">
      <section className="w-full max-w-md text-center space-y-8">
        {/* Brand */}
        <Image
          src="https://fra.cloud.appwrite.io/v1/storage/buckets/68d2931900387c9110e6/files/696ee3b60025e2a2c4ff/view?project=682272b1001e9d1609a8"
          alt="Omenai"
          width={130}
          height={40}
          className="mx-auto"
          priority
        />

        {/* Heading */}
        <div className="space-y-3">
          <h1 className="text-fluid-lg font-semibold tracking-tight">
            Designed for a larger canvas
          </h1>

          <p className="text-fluid-base text-dark/70 leading-relaxed">
            The Omenai Dashboard is thoughtfully crafted for desktop screens,
            giving you the space and clarity needed to manage your work
            effortlessly.
          </p>
        </div>

        {/* Value list */}
        <ul className="text-left text-fluid-base text-dark space-y-3 rounded border border-dark/10 p-5 bg-dark/5">
          <li className="flex gap-2">
            <span>—</span>
            <span>Upload, curate, and manage artworks with ease</span>
          </li>
          <li className="flex gap-2">
            <span>—</span>
            <span>Track orders and shipments in real time</span>
          </li>
          <li className="flex gap-2">
            <span>—</span>
            <span>Withdraw earnings securely and transparently</span>
          </li>
          <li className="flex gap-2">
            <span>—</span>
            <span>Experience Omenai at its full potential</span>
          </li>
        </ul>

        <p className="text-fluid-sm text-dark/60 pt-4 leading-relaxed">
          Prefer managing things on the go?
          <br />
          The Omenai mobile app is designed for a seamless experience on mobile.
        </p>

        {/* App CTAs */}
        <div className="flex flex-col items-center gap-4 pt-2">
          <Link
            href="https://play.google.com/store/apps/details?id=com.omenai.app"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-opacity hover:opacity-90"
          >
            <Image
              src="/google_appstore.png"
              alt="Get Omenai on Google Play"
              width={170}
              height={52}
            />
          </Link>

          <Link
            href="https://apps.apple.com/app/omenai/id1234567890"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-opacity hover:opacity-90"
          >
            <Image
              src="/apple_appstore.png"
              alt="Download Omenai on the App Store"
              width={170}
              height={52}
            />
          </Link>
        </div>

        {/* Gentle nudge */}
        <p className="text-fluid-sm text-dark/60 pt-4">
          On a desktop already? Expanding your window or switching devices will
          get you right back in.
        </p>
      </section>
    </main>
  );
}
