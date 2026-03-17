import { MessageSquareText } from "lucide-react";

interface CurationResponseProps {
  status: string;
  adminNotes?: string;
  declineReason?: string;
}

export default function CurationResponse({
  status,
  adminNotes,
  declineReason,
}: CurationResponseProps) {
  if (status === "PENDING_ARTIST_ACTION") {
    return (
      <div className="bg-amber-50 border border-amber-100/50 rounded-lg p-4 flex gap-3 items-start">
        <MessageSquareText
          size={18}
          className="text-amber-600 shrink-0 mt-0.5"
        />
        <div>
          <span className="text-xs font-bold text-amber-900 uppercase tracking-wider block mb-1">
            Reviewer Notes
          </span>
          <p className="text-sm text-amber-900/80 leading-relaxed italic">
            "
            {adminNotes ||
              "We propose this counter-offer to ensure a rapid sell-through rate based on market traction."}
            "
          </p>
        </div>
      </div>
    );
  }

  if (status === "PENDING_ADMIN_REVIEW") {
    return (
      <p className="text-sm text-neutral-600 bg-white p-4 rounded-lg border border-neutral-200 shadow-sm">
        Your proof of value is currently under review by our curation team.
        Expected turnaround is less than 24 hours.
      </p>
    );
  }

  if (status === "DECLINED_BY_ADMIN") {
    return (
      <div className="bg-rose-50 border border-rose-100 rounded-lg p-4">
        <span className="text-xs font-bold text-rose-900 uppercase tracking-wider block mb-1">
          Decline Reason
        </span>
        <p className="text-sm text-rose-800/90">{declineReason}</p>
      </div>
    );
  }

  return (
    <p className="text-sm text-neutral-500 italic px-2">
      No additional actions required for this request.
    </p>
  );
}
