// components/FeatureBlocker.tsx
"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { base_url } from "@omenai/url-config/src/config";

interface FeatureBlockerProps {
  message?: string;
}

const OnboardingBlockerScreen = ({ message }: FeatureBlockerProps) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-300 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="bg-white rounded-2xl shadow-lg max-w-lg w-full p-10 flex flex-col items-center text-center"
      >
        <motion.div
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="mb-6"
        >
          {/* Example friendly icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-20 w-20 text-dark"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </motion.div>

        <h1
          className="font-sans text-dark font-bold mb-2"
          style={{
            fontSize: "clamp(1.422rem, 1.2vw + 1.2rem, 1.602rem)",
          }}
        >
          Registeration page is temporarily unavailable
        </h1>
        <p
          className="mb-6 text-gray-200"
          style={{ fontSize: "clamp(0.889rem, 0.5vw + 0.8rem, 1rem)" }}
        >
          {message ||
            `We’re fixing some issues right now. Please check back soon or explore other parts of the app and see what tickles your fancy.`}
        </p>

        <p
          className="mb-6 text-gray-200"
          style={{ fontSize: "clamp(0.889rem, 0.5vw + 0.8rem, 1rem)" }}
        >
          Thank you for your patience ❤️
        </p>

        <Link
          href={base_url()}
          className="bg-dark text-white font-sans px-6 py-3 rounded shadow hover:bg-opacity-90 transition-all"
          style={{ fontSize: "clamp(0.889rem, 0.5vw + 0.8rem, 1rem)" }}
        >
          Explore Omenai
        </Link>
      </motion.div>
    </div>
  );
};

export default OnboardingBlockerScreen;
