import { artistActionStore } from "@omenai/shared-state-store/src/artist/actions/ActionStore";
import { Lock, X, DollarSign } from "lucide-react";

export function WalletWithdrawalBlockerModal({
  message = "We’re working on a brief fix to our wallet system. Withdrawals are temporarily unavailable, but your funds are safe and access will be restored soon.",
}) {
  const { toggleWithdrawalFormPopup, withdrawalFormPopup } =
    artistActionStore();
  return (
    // Fixed Modal Overlay
    <div className="fixed inset-0 z-50 bg-[#0f172a]/5 backdrop-blur-sm flex items-center justify-center p-4 font-sans">
      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-[#0f172a] border border-[#47748E]/30 rounded shadow-2xl p-8 text-center animate-in zoom-in duration-300">
        {/* Close Button Placeholder (Assuming a parent component handles actual closure) */}
        <button
          onClick={() => toggleWithdrawalFormPopup(false)}
          className="absolute top-4 right-4 text-[#818181] hover:text-[#FCFCFC] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* --- Central Art: The Vault Door --- */}
        <div className="mb-6 relative w-20 h-20 mx-auto">
          <div className="absolute inset-0 bg-[#2A9EDF]/20 rounded blur-lg animate-pulse"></div>
          <div className="relative w-full h-full bg-[#0f172a] border-4 border-[#2A9EDF] rounded flex items-center justify-center">
            {/* Inner Lock Icon */}
            <Lock className="w-8 h-8 text-[#2A9EDF]" />
            {/* Currency Symbol Overlay */}
            <div className="absolute -bottom-1 -right-1 bg-[#0f172a] rounded p-1 border border-[#2A9EDF]">
              <DollarSign className="w-4 h-4 text-[#2A9EDF]" />
            </div>
          </div>
        </div>

        {/* --- Content --- */}
        <h2 className="text-white text-[clamp(1.422rem,1.2vw+1.2rem,1.602rem)] font-bold tracking-tight mb-3 leading-tight">
          Wallet Withdrawal currently{" "}
          <span className="text-[#2A9EDF]">Inactive</span>
        </h2>

        <p className="text-[#818181] text-center max-w-sm mx-auto text-[clamp(0.889rem,0.5vw+0.8rem,1rem)] leading-relaxed mb-8">
          {message}
        </p>

        {/* --- Call to Action/Information --- */}
        {/* <div className="mt-6">
          <button
            // In a real app, this button might link to a status page or contact support.
            // For this example, it's just styled as a primary action.
            className="w-full py-3 bg-[#2A9EDF] text-white font-medium text-[clamp(0.79rem,0.35vw+0.7rem,0.889rem)] rounded hover:bg-opacity-90 transition-all shadow-[0_4px_15px_rgba(42,158,223,0.4)]"
          >
            Review Security Status
          </button>
        </div> */}

        {/* Footer Note */}
        <p className="mt-6 text-[12px] text-[#47748E] font-semibold font-mono uppercase tracking-widest">
          Your Funds Remain Secure
        </p>
      </div>
    </div>
  );
}
