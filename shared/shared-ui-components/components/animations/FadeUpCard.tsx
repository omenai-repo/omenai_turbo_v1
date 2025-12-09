"use client";

import { motion, Variants } from "framer-motion";

const fadeVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: "easeOut" },
  },
};

export default function FadeCard({ children }: { children: React.ReactNode }) {
  return <motion.div variants={fadeVariants}>{children}</motion.div>;
}
