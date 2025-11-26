"use client";

import React from "react";
import {
  CircleCheckBig,
  PackageSearch,
  Calculator,
  CreditCard,
  Clock,
  ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { actionStore } from "@omenai/shared-state-store/src/actions/ActionStore";
export default function OrderReceived() {
  const { toggleOrderReceivedModal } = actionStore();

  const nextSteps = [
    {
      icon: PackageSearch,
      title: "Order Processing",
      description:
        "Your request has been securely placed. We will review and process it within the next 72 hours.",
    },
    {
      icon: Calculator,
      title: "Validation & Logistics",
      description:
        "We validate order details, assess shipping availability to your location, and calculate applicable shipping and tax charges.",
    },
    {
      icon: CreditCard,
      title: "Payment Window",
      description:
        "Upon approval, you will receive a payment link. Payment must be completed within 24 hours to secure your purchase",
    },
    {
      icon: Clock,
      title: "Auto-Expiration",
      description:
        "If we cannot process the request within 72 hours, the order will be automatically declined, allowing you to retry later.",
    },
  ];

  // Animation Variants
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
    <div className="flex flex-col h-full w-full bg-white overflow-y-scroll">
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
            Order Received
          </h2>

          <p className="mt-2 text-slate-700 text-fluid-xxs leading-relaxed max-w-xs mx-auto">
            We've sent a confirmation email
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
                  <p className="mt-0.5 text-fluid-xxs text-slate-700 leading-relaxed pr-2">
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
        <a
          onClick={(e) => {
            e.preventDefault();
            toggleOrderReceivedModal(false);
          }}
          href="/catalog"
          className="group w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-black text-white px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98] cursor-pointer"
        >
          <span>Continue Browsing</span>
        </a>
      </motion.div>
    </div>
  );
}
