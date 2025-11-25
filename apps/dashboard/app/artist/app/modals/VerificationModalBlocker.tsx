"use client";
import { Modal } from "@mantine/core";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { toast } from "sonner";
import {
  CircleCheckBig,
  PackageSearch,
  Calculator,
  CreditCard,
  Clock,
  ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";

export default function VerificationBlockerModal({ open }: { open: boolean }) {
  const { signOut } = useAuth({ requiredRole: "artist" });
  const nextSteps = [
    {
      icon: PackageSearch,
      title: "Test Data",
      description:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been ",
    },
    {
      icon: Calculator,
      title: "Test Data",
      description:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been ",
    },
    {
      icon: CreditCard,
      title: "Test Data",
      description:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been ",
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

  async function handleSignOut() {
    toast.info("Signing out...", {
      description: "You will be redirected to the login page",
    });

    await signOut();
  }

  return (
    <Modal
      opened={open}
      onClose={() => {}}
      radius={"md"}
      centered
      p={16}
      size={"lg"}
    >
      <div className="flex flex-col h-full w-full bg-white overflow-y-scroll">
        {/* Scrollable Content Region */}
        <div>
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
              Verification in Progress
            </h2>

            <p className="mt-2 text-gray-500 text-fluid-xxs leading-relaxed max-w-lg mx-auto">
              Your profile is currently under review. You&apos;ll be notified
              once your verification status is updated. In the meantime, access
              to dashboard features is currently restricted. Please check back
              later.
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
          <button
            onClick={async () => await handleSignOut()}
            className="group w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-black text-white px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98] cursor-pointer"
          >
            Logout
          </button>
        </motion.div>
      </div>
    </Modal>
    // <>
    //   <Modal
    //     opened={open}
    //     onClose={() => {}}
    //     radius={"md"}
    //     centered
    //     p={16}
    //     size={"lg"}
    //   >
    //     <div className="bg-white text-black dark:bg-[#0f172a] dark:text-white w-full text-center p-8">
    //       <h2 className="text-fluid-sm md:text-fluid-md font-semibold mb-4">
    //         Verification in Progress
    //       </h2>
    //       <p className="text-fluid-xxs text-gray-700 dark:text-gray-300 mb-6">
    //         Your profile is currently under review. You&apos;ll be notified once
    //         your verification status is updated. In the meantime, access to
    //         dashboard features is currently restricted. Please check back later.
    //       </p>
    //       <div className="w-full flex justify-center mt-8">
    //         <button
    //           onClick={async () => await handleSignOut()}
    //           className="h-[35px] p-5 rounded w-fit flex items-center justify-center gap-3 disabled:cursor-not-allowed disabled:bg-dark/10 disabled:text-[#A1A1A1] bg-dark text-white text-fluid-xxs font-normal"
    //         >
    //           Logout
    //         </button>
    //       </div>
    //     </div>
    //   </Modal>
    // </>
  );
}
