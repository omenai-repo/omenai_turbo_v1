import { Clock, AlertCircle, CheckCircle2, XCircle } from "lucide-react";

interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  switch (status) {
    case "PENDING_ADMIN_REVIEW":
      return (
        <span className="flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded -full text-xs font-semibold">
          <Clock size={12} /> Under Review
        </span>
      );
    case "PENDING_ARTIST_ACTION":
      return (
        <span className="flex items-center gap-1.5 bg-amber-100 text-amber-800 border border-amber-300 px-3 py-1 rounded -full text-xs font-bold animate-pulse">
          <AlertCircle size={12} /> Action Required
        </span>
      );
    case "APPROVED_ARTIST_PRICE":
    case "APPROVED_COUNTER_PRICE":
    case "AUTO_APPROVED":
      return (
        <span className="flex items-center gap-1.5 bg-green-50 text-green-700 border border-green-200 px-3 py-1 rounded -full text-xs font-semibold">
          <CheckCircle2 size={12} /> Approved & Published
        </span>
      );
    case "DECLINED_BY_ADMIN":
    case "DECLINED_BY_ARTIST":
      return (
        <span className="flex items-center gap-1.5 bg-neutral-100 text-neutral-600 border border-neutral-200 px-3 py-1 rounded -full text-xs font-semibold">
          <XCircle size={12} /> Upload Cancelled
        </span>
      );
    default:
      return null;
  }
}
