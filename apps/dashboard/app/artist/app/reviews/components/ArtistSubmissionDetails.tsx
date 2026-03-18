import { ExternalLink } from "lucide-react";

interface ArtistSubmissionDetailsProps {
  justificationType: string;
  justificationProofUrl?: string;
  justificationNotes?: string;
}

export default function ArtistSubmissionDetails({
  justificationType,
  justificationProofUrl,
  justificationNotes,
}: ArtistSubmissionDetailsProps) {
  return (
    <div className="bg-white border border-neutral-200 rounded-lg p-4 shadow-sm flex flex-col sm:flex-row sm:flex-wrap gap-4 sm:gap-8">
      <div>
        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
          Justification Type
        </span>
        <p className="text-sm font-medium text-dark capitalize">
          {justificationType?.replace(/_/g, " ").toLowerCase() || "N/A"}
        </p>
      </div>

      {justificationProofUrl && (
        <div>
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
            Submitted Proof
          </span>
          <a
            href={justificationProofUrl}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
          >
            View Attachment/Link <ExternalLink size={14} />
          </a>
        </div>
      )}

      {justificationNotes && (
        <div className="w-full mt-2 sm:mt-0">
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
            Your Notes
          </span>
          <p className="text-sm text-neutral-600 italic">
            "{justificationNotes}"
          </p>
        </div>
      )}
    </div>
  );
}
