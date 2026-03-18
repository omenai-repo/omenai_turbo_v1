import { ShieldAlert } from "lucide-react";

export default function WarningAlert() {
  return (
    <div className="relative overflow-hidden bg-rose-50 border border-rose-100 rounded -xl p-5 sm:p-6 transition-all shadow-sm animate-in fade-in slide-in-from-bottom-2">
      {/* Subtle background gradient flare for a premium feel */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-rose-500/5 rounded -full blur-2xl pointer-events-none"></div>

      <div className="flex items-start gap-4 relative z-10">
        {/* Icon Container */}
        <div className="flex-shrink-0 mt-0.5">
          <div className="w-10 h-10 flex items-center justify-center rounded -full bg-white border border-rose-200 text-rose-600 shadow-sm">
            <ShieldAlert size={20} strokeWidth={2} />
          </div>
        </div>

        {/* Content */}
        <div>
          <h3 className="text-sm font-bold text-rose-900 mb-1.5 tracking-tight">
            Important Policy Agreement
          </h3>
          <p className="text-xs text-rose-800/80 leading-relaxed max-w-2xl">
            By accepting this order, you agree to{" "}
            <strong className="text-rose-900 font-bold">
              hold the artwork for 24 hours
            </strong>{" "}
            to allow for payment and shipment processing. If the piece is on
            exhibition and paid for by this buyer, shipment will be scheduled
            securely at the exhibition&apos;s end date.
          </p>
        </div>
      </div>
    </div>
  );
}
