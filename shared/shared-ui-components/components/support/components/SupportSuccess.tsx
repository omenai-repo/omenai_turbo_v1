import { Icons } from "../util";
import { toast_notif } from "@omenai/shared-utils/src/toast_notification";

interface SupportSuccessProps {
  ticketId: string;
  onClose: () => void;
}

export function SupportSuccess({ ticketId, onClose }: SupportSuccessProps) {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(ticketId);
    toast_notif("Ticket ID copied to clipboard", "success");
  };

  return (
    <div className="p-10 flex flex-col items-center text-center space-y-7 bg-white">
      <div className="w-24 h-24 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-full flex items-center justify-center border border-slate-300 shadow-[0_8px_30px_-12px_rgba(16,185,129,0.3)]">
        <Icons.Success />
      </div>

      <div className="space-y-2.5">
        <h3 className="text-2xl font-light text-dark tracking-tight">
          Request Received
        </h3>
        <p className="text-sm text-slate-500 max-w-[280px] mx-auto leading-relaxed font-light">
          Our team has been notified and will review your request shortly.
        </p>
      </div>

      <div
        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-5 relative group cursor-pointer transition-all duration-300 hover:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.08)]"
        onClick={copyToClipboard}
      >
        <p className="text-[10px] uppercase tracking-[0.15em] text-slate-500 font-medium mb-2">
          Ticket ID
        </p>
        <div className="flex items-center justify-center gap-2.5">
          <span className="text-2xl font-light text-dark tracking-tight font-mono">
            {ticketId}
          </span>
          <button className="text-slate-400 hover:text-dark transition-colors p-1">
            <Icons.Copy />
          </button>
        </div>
        <p className="text-[10px] text-slate-400 mt-2.5 font-light">
          Tap to copy • Keep for your records
        </p>
      </div>

      <button
        onClick={onClose}
        className="w-full bg-dark text-white font-light py-3.5 rounded-lg hover:bg-black transition-all duration-300 shadow-[0_4px_14px_0_rgba(0,0,0,0.1)] border border-slate-300"
      >
        Close
      </button>
    </div>
  );
}
