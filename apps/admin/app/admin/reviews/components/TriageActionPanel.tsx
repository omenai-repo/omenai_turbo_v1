import {
  INPUT_CLASS,
  TEXTAREA_CLASS,
} from "@omenai/shared-ui-components/components/styles/inputClasses";
import { CheckCircle2, AlertTriangle, XCircle, Loader2 } from "lucide-react";

interface TriageActionPanelProps {
  activeAction: "APPROVE" | "COUNTER_OFFER" | "DECLINE" | null;
  setActiveAction: (
    action: "APPROVE" | "COUNTER_OFFER" | "DECLINE" | null,
  ) => void;
  counterPrice: number | "";
  setCounterPrice: (val: number | "") => void;
  adminNotes: string;
  setAdminNotes: (val: string) => void;
  declineReason: string;
  setDeclineReason: (val: string) => void;
  onSubmit: () => void;
  isMutating: boolean;
}

export default function TriageActionPanel({
  activeAction,
  setActiveAction,
  counterPrice,
  setCounterPrice,
  adminNotes,
  setAdminNotes,
  declineReason,
  setDeclineReason,
  onSubmit,
  isMutating,
}: TriageActionPanelProps) {
  return (
    <div className="p-6 lg:p-10 bg-neutral-50 flex-1">
      <h3 className="text-sm font-bold text-dark uppercase tracking-wider mb-4">
        Make a Decision
      </h3>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <button
          onClick={() => setActiveAction("APPROVE")}
          className={`flex-1 py-3 px-4 rounded border text-sm font-normal flex justify-center items-center gap-2 transition-all ${
            activeAction === "APPROVE"
              ? "bg-green-50 border-green-600 text-green-700 shadow-sm"
              : "bg-white border-neutral-300 text-neutral-600 hover:bg-neutral-50"
          }`}
        >
          <CheckCircle2 size={16} /> Approve Request
        </button>
        <button
          onClick={() => setActiveAction("COUNTER_OFFER")}
          className={`flex-1 py-3 px-4 rounded border text-sm font-normal flex justify-center items-center gap-2 transition-all ${
            activeAction === "COUNTER_OFFER"
              ? "bg-amber-50 border-amber-600 text-amber-700 shadow-sm"
              : "bg-white border-neutral-300 text-neutral-600 hover:bg-neutral-50"
          }`}
        >
          <AlertTriangle size={16} /> Send Counter-Offer
        </button>
        <button
          onClick={() => setActiveAction("DECLINE")}
          className={`flex-1 py-3 px-4 rounded border text-sm font-normal flex justify-center items-center gap-2 transition-all ${
            activeAction === "DECLINE"
              ? "bg-rose-50 border-rose-600 text-rose-700 shadow-sm"
              : "bg-white border-neutral-300 text-neutral-600 hover:bg-neutral-50"
          }`}
        >
          <XCircle size={16} /> Decline entirely
        </button>
      </div>

      {activeAction === "COUNTER_OFFER" && (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
          <div>
            <label className="text-sm font-bold text-dark">
              Counter Price (USD)
            </label>
            <input
              type="number"
              value={counterPrice}
              onChange={(e) => setCounterPrice(Number(e.target.value))}
              placeholder="e.g. 11000"
              className={INPUT_CLASS}
            />
          </div>
          <div>
            <label className="text-sm font-bold text-dark">
              Notes for the Artist (Required for counter)
            </label>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Explain why you are countering to help them understand market realities..."
              rows={4}
              className={TEXTAREA_CLASS}
            />
          </div>
        </div>
      )}

      {activeAction === "DECLINE" && (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
          <div>
            <label className="text-sm font-bold text-dark">
              Decline Reason
            </label>
            <textarea
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              placeholder="Explain why this request is being rejected..."
              rows={4}
              className={TEXTAREA_CLASS}
            />
          </div>
        </div>
      )}

      {activeAction && (
        <button
          onClick={onSubmit}
          disabled={isMutating}
          className="w-full mt-6 py-4 bg-dark text-white text-fluid-xs rounded font-normal shadow hover:bg-black transition-colors flex justify-center items-center gap-2 disabled:opacity-50"
        >
          {isMutating && <Loader2 size={18} className="animate-spin" />}
          Confirm & Send Decision
        </button>
      )}
    </div>
  );
}
