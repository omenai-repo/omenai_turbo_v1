"use client";

import React from "react";
import { PackageSearch, Calculator, CreditCard, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { actionStore } from "@omenai/shared-state-store/src/actions/ActionStore";
import { base_url } from "@omenai/url-config/src/config";

export default function OrderReceived() {
  const { toggleOrderReceivedModal } = actionStore();

  const nextSteps = [
    {
      icon: PackageSearch,
      title: "Processing",
      description: "Request securely logged. Review pending (72h max).",
    },
    {
      icon: Calculator,
      title: "Validation",
      description: "Logistics assessment and final tax calculation.",
    },
    {
      icon: CreditCard,
      title: "Invoice",
      description: "Secure payment link sent upon approval (Valid 24h).",
    },
    {
      icon: Clock,
      title: "Expiration",
      description: "Auto-decline if unprocessed after 72 hours.",
    },
  ];

  return (
    <div className="flex h-full w-full flex-col bg-white p-2">
      {/* 1. HEADER: The Signal */}
      <div className="mb-8 text-center pt-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-6 flex h-12 w-12 items-center justify-center"
        >
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded h-3 w-3 bg-emerald-500"></span>
          </span>
        </motion.div>

        <h2 className="font-serif text-3xl italic text-dark">
          Request Initiated.
        </h2>
        <p className="mx-auto mt-2 max-w-xs font-sans text-xs text-neutral-500">
          A confirmation dossier has been sent to your email.
        </p>
      </div>

      {/* 2. THE PROTOCOL TIMELINE */}
      <div className="flex-1 overflow-y-auto px-4">
        <div className="border-l border-neutral-200 pl-8 relative space-y-8 py-2">
          {nextSteps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 + 0.3 }}
              className="relative"
            >
              {/* Timeline Marker */}
              <div className="absolute -left-[37px] top-1 flex h-4 w-4 items-center justify-center bg-white">
                <div className="h-1.5 w-1.5 bg-dark rounded" />
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[9px] text-neutral-400">
                    0{index + 1}
                  </span>
                  <h4 className="font-mono text-xs uppercase tracking-widest text-dark">
                    {step.title}
                  </h4>
                </div>
                <p className="font-sans text-xs text-neutral-500 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 3. ACTION: Return to Gallery */}
      <div className="mt-6 border-t border-neutral-100 pt-6">
        <button
          onClick={(e) => {
            e.preventDefault();
            window.location.href = `${base_url()}/catalog`;
            toggleOrderReceivedModal(false);
          }}
          className="group w-full flex h-12 items-center justify-center bg-dark text-white hover:bg-neutral-800 transition-colors"
        >
          <span className="font-mono text-xs uppercase tracking-[0.2em]">
            Return to Collection
          </span>
        </button>
      </div>
    </div>
  );
}
