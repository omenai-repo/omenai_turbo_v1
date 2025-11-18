"use client";

import { artistActionStore } from "@omenai/shared-state-store/src/artist/actions/ActionStore";
import WithdrawalModalForm from "./WithdrawalModalForm";
import { AnimatePresence, motion } from "framer-motion";
import { useHighRiskFeatureFlag } from "@omenai/shared-hooks/hooks/useConfigCatFeatureFlag";
import { WalletWithdrawalBlockerModal } from "./WithdrawalBlockerModal";

export const WithdrawalModal = () => {
  const { toggleWithdrawalFormPopup, withdrawalFormPopup } =
    artistActionStore();

  const { value: isWalletWithdrawalEnabled } = useHighRiskFeatureFlag(
    "wallet_withdrawal_enabled"
  );

  return (
    <AnimatePresence key={13}>
      {withdrawalFormPopup && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            toggleWithdrawalFormPopup(false);
          }}
          className="bg-slate-900/20 backdrop-blur px-2 fixed inset-0 z-50 grid place-items-center cursor-pointer"
        >
          <motion.div className=" text-dark rounded w-full max-w-lg shadow-xl cursor-default relative h-auto">
            {/* Add modal form here */}
            <div className="h-auto w-full">
              {!isWalletWithdrawalEnabled ? (
                <WalletWithdrawalBlockerModal />
              ) : (
                <WithdrawalModalForm />
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
