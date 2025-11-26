"use client";

import { motion } from "framer-motion";

interface EmptyStateProps {
  title?: string;
  message?: string;
  className?: string;
}

export default function NotFoundData({
  title = "No Data Found",
  message = "It Feels a little empty here.",
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`w-full flex items-center justify-center py-12 relative overflow-hidden ${className}`}
    >
      {/* 🟡 Floating Animated Shape #1 */}
      <motion.div
        className="absolute top-6 left-10 w-10 h-10 rounded-full bg-cyan-500/20"
        animate={{ y: [0, -12, 0], x: [0, 6, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* 🔵 Floating Animated Shape #2 */}
      <motion.div
        className="absolute bottom-10 right-12 w-14 h-14 rounded-full bg-teal-400/20"
        animate={{ y: [0, 10, 0], x: [0, -8, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* 🟣 Floating Animated Shape #3 */}
      <motion.div
        className="absolute bottom-16 left-1/3 w-8 h-8 rounded-lg bg-indigo-500/20"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex flex-col items-center text-center relative z-20 px-4"
      >
        {/* ✨ Illustration (Clean SVG) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="w-40 h-40 mb-4"
        >
          <EmptyArtIllustration />
        </motion.div>

        {/* Title */}
        <h3 className="text-fluid-sm font-semibold text-slate-800 dark:text-white">
          {title}
        </h3>

        {/* Message */}
        <p className="mt-1 text-fluid-xs text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed">
          {message}
        </p>
      </motion.div>
    </div>
  );
}

/* 🎨 Simple Abstract Illustration — lightweight & theme-friendly */
function EmptyArtIllustration() {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="100" cy="100" r="80" fill="#e2e8f0" opacity="0.35" />

      <rect
        x="55"
        y="70"
        width="90"
        height="60"
        rx="10"
        fill="#cbd5e1"
        opacity="0.8"
      />

      <rect x="65" y="80" width="70" height="10" rx="4" fill="#94a3b8" />

      <rect
        x="65"
        y="100"
        width="50"
        height="10"
        rx="4"
        fill="#94a3b8"
        opacity="0.7"
      />

      <circle cx="135" cy="130" r="14" fill="#94a3b8" opacity="0.55" />
    </svg>
  );
}
