import { ExternalLink } from "lucide-react";

interface JustificationProofProps {
  justificationType: string;
  justificationProofUrl: string;
  justificationNotes: string;
}

export default function JustificationProof({
  justificationType,
  justificationProofUrl,
  justificationNotes,
}: JustificationProofProps) {
  return (
    <div className="p-6 lg:p-10 border-b border-neutral-100 space-y-6">
      <h3 className="text-sm font-bold text-dark uppercase tracking-wider">
        Artist's Proof of Value
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1">
          <p className="text-xs text-neutral-500">Justification Type</p>
          <p className="text-sm font-medium text-dark capitalize">
            {justificationType.replace(/_/g, " ").toLowerCase()}
          </p>
        </div>
        {justificationProofUrl && (
          <div className="space-y-1">
            <p className="text-xs text-neutral-500">Verification Link</p>
            <a
              href={justificationProofUrl}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-medium text-blue-600 hover:underline flex items-center gap-1"
            >
              View External Proof <ExternalLink size={14} />
            </a>
          </div>
        )}
      </div>

      {justificationNotes && (
        <div className="space-y-1">
          <p className="text-xs text-neutral-500">Artist Notes</p>
          <p className="text-fluid-xs text-dark bg-neutral-50 p-5 rounded border border-neutral-100 shadow-inner">
            "{justificationNotes}"
          </p>
        </div>
      )}
    </div>
  );
}
