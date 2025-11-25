"use client";
import { actionStore } from "@omenai/shared-state-store/src/actions/ActionStore";
import Link from "next/link";
import { CircleCheckBig, Calculator, Send, Bell } from "lucide-react";
import { dashboard_url } from "@omenai/url-config/src/config";
import { motion } from "framer-motion";
export default function OnboardingRequestModalForm() {
  const { setOpenOnboardingCompletedModal } = actionStore();
  const nextSteps = [
    {
      icon: Send,
      title: "Request Submitted",
      description:
        "Your request has been successfully submitted, and our admin team has been notified",
    },
    {
      icon: Calculator,
      title: "Verification Process",
      description:
        "We will review your information against publicly available data to confirm its authenticity.",
    },
    {
      icon: Bell,
      title: "Status Update",
      description:
        "You will receive an update on your verification status within 24–48 hours.",
    },
  ];
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
  };
  return (
    <div className="flex flex-col h-full w-full bg-white overflow-y-hidden">
      {/* Scrollable Content Region */}
      <div className="flex-1 overflow-y-scroll pr-2">
        {/* Animated Header */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="pb-6 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 15,
              delay: 0.1,
            }}
            className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3 ring-4 ring-green-50/50"
          >
            <CircleCheckBig
              className="w-7 h-7 text-green-600"
              strokeWidth={2}
            />
          </motion.div>

          <h2 className="text-fluid-sm font-bold text-gray-900 tracking-tight">
            Onboarding completed successfully
          </h2>

          <p className="mt-2 text-gray-500 text-fluid-xxs leading-relaxed max-w-lg mx-auto">
            We have received your information and are currently verifying your
            details. This process typically takes between 24 to 48 hours. We
            appreciate your patience.
          </p>
        </motion.div>

        <div>
          <h3 className="text-fluid-xxs font-semibold uppercase tracking-wider text-dark mb-6 flex items-center gap-2">
            What happens next?
            <span className="h-px bg-gray-200 flex-1"></span>
          </h3>
        </div>

        {/* Animated Timeline */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="pb-4"
        >
          <div className="space-y-5 relative pl-2">
            {/* Vertical Line Connector */}
            <div
              className="absolute left-[27px] top-2 bottom-4 w-px bg-gray-100"
              aria-hidden="true"
            />

            {nextSteps.map((step, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="relative flex gap-4 group"
              >
                <div className="relative z-10 flex-shrink-0 w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm group-hover:border-gray-300 group-hover:scale-110 transition-all duration-300">
                  <step.icon
                    className="w-4 h-4 text-gray-600"
                    strokeWidth={1.5}
                  />
                </div>
                <div className="flex-1 pt-0.5">
                  <h4 className="text-sm font-semibold text-gray-900">
                    {step.title}
                  </h4>
                  <p className="mt-0.5 text-fluid-xxs text-gray-500 leading-relaxed pr-2">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Sticky Footer Action */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="pt-4 mt-scroll border-t border-gray-50 bg-white z-10"
      >
        <Link href={`${dashboard_url()}/artist/app/overview`}>
          <button
            onClick={() => setOpenOnboardingCompletedModal(false)}
            className="text-fluid-xxs h-[35px] p-5 rounded w-full flex items-center justify-center gap-3 disabled:cursor-not-allowed disabled:bg-dark/10 disabled:text-[#A1A1A1] bg-dark text-white font-normal"
          >
            Go to dashboard
          </button>
        </Link>
      </motion.div>
    </div>
  );
}
