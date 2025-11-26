"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function NotFoundPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen w-full bg-gray-50 flex flex-col items-center justify-center text-center px-6">
      {/* Glowing 404 number */}
      <div className="relative mb-8 group">
        <div className="absolute inset-0 blur-2xl bg-amber-400/30 group-hover:bg-orange-400/40 transition-all duration-500" />
        <h1
          className="relative text-8xl sm:text-9xl md:text-[180px] lg:text-[220px] font-bold text-transparent bg-clip-text bg-gradient-to-br from-amber-600 via-orange-500 to-rose-500 leading-none tracking-tight select-none"
          style={{
            transition: "transform 0.1s ease-out",
            textShadow: "0 10px 40px rgba(251, 146, 60, 0.3)",
          }}
        >
          404
        </h1>
      </div>

      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="mt-4 text-2xl md:text-3xl font-semibold text-gray-700"
      >
        Page Not Found
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="mt-4 text-slate-700 max-w-md"
      >
        The page you’re looking for doesn’t exist or may have been moved. Let’s
        get you back on track.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.6 }}
        className="mt-8"
      >
        <button
          onClick={() => router.back()}
          className="relative inline-block px-6 py-3 text-lg font-medium text-dark border border-dark rounded-full overflow-hidden group"
        >
          <span className="absolute inset-0 bg-dark transition-all duration-300 ease-out transform scale-x-0 origin-left group-hover:scale-x-100" />
          <span className="relative z-10 group-hover:text-white transition-colors duration-300">
            Go back
          </span>
        </button>
      </motion.div>
    </div>
  );
}
