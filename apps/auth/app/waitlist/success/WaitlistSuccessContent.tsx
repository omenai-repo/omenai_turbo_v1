"use client";
import { IndividualLogo } from "@omenai/shared-ui-components/components/logo/Logo";
import React from "react";
import { Instagram, Facebook, Linkedin } from "lucide-react";
import { base_url } from "@omenai/url-config/src/config";
import { motion } from "framer-motion";
import { redirect } from "next/navigation";
import { useLowRiskFeatureFlag } from "@omenai/shared-hooks/hooks/useConfigCatFeatureFlag";

export default function WaitlistSuccessContent() {
  const { value: waitlistActivated } = useLowRiskFeatureFlag(
    "waitlistActivated",
    true
  );
  if (!waitlistActivated) redirect("/regiter");
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <IndividualLogo />
      </motion.div>
      <div className="z-10 max-w-[540px] text-center flex flex-col items-center gap-6">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-fluid-3xl font-bold "
        >
          Welcome to the Omenai community. We're excited to have you on board.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          Thank you for joining our waitlist! You're now among the first to know
          when we launch. We'll keep you updated on our progress and send you
          early access as soon as it's ready.
        </motion.p>
        <motion.a
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          type="submit"
          className=" p-4 rounded w-full flex items-center justify-center gap-3 disabled:cursor-not-allowed disabled:bg-dark/10 disabled:text-[#A1A1A1] bg-dark text-white text-fluid-base font-medium"
          href={base_url()}
        >
          Explore Omenai
        </motion.a>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="flex space-x-4 mt-4 pb-4"
        >
          {[
            { Icon: Instagram, href: "https://instagram.com/omenaiofficial" },
            { Icon: Facebook, href: "https://facebook.com/omenaiofficial" },
            {
              Icon: Linkedin,
              href: "https://linkedin.com/company/omenaiart",
            },
          ].map(({ Icon, href }) => (
            <motion.a
              key={href}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.1 }}
              className="text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              <Icon size={20} />
            </motion.a>
          ))}
        </motion.div>
      </div>
    </>
  );
}
