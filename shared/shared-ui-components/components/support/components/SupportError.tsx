import { Icons } from "../util";

interface SupportErrorProps {
  message: string;
  onRetry: () => void;
  onClose: () => void;
}

export function SupportError({ message, onRetry, onClose }: SupportErrorProps) {
  return (
    <div className="p-10 flex flex-col items-center text-center space-y-7 bg-white">
      <div className="w-24 h-24 bg-gradient-to-br from-rose-50 to-red-50 rounded-full flex items-center justify-center border border-slate-300 shadow-[0_8px_30px_-12px_rgba(244,63,94,0.3)]">
        <Icons.Error />
      </div>

      <div className="space-y-2.5">
        <h3 className="text-2xl font-normal text-dark tracking-tight">
          Request Failed
        </h3>
        <p className="text-sm text-slate-500 max-w-[280px] mx-auto leading-relaxed font-normal">
          {message || "We couldn't process your request. Please try again."}
        </p>
      </div>

      <div className="w-full space-y-3">
        <button
          onClick={onRetry}
          className="w-full bg-dark text-white font-normal py-3.5 rounded-lg hover:bg-black transition-all duration-300 shadow-[0_4px_14px_0_rgba(0,0,0,0.1)] border border-slate-300"
        >
          Try Again
        </button>
        <button
          onClick={onClose}
          className="w-full text-slate-600 font-normal py-3 rounded-lg hover:bg-slate-100 transition-all duration-200"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
