"use client";

import { MessageCircleWarning, OctagonAlert } from "lucide-react";

type Commitment = {
  type: string;
  description: string;
  metadata?: Record<string, any>;
};
export default function DeleteAccountCommitmentModal({
  commitments,
  setShowCommitments,
}: {
  commitments: Commitment[];
  setShowCommitments: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 w-full h-full bg-dark/90">
      <div className="relative bg-white dark:bg-slate-800 rounded shadow-xl w-full max-w-xl px-6 py-12 z-10 overflow-y-auto max-h-[90vh] scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded bg-yellow-50 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-yellow-600"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>

          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Outstanding commitments
            </h3>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              We can’t start the deletion process until the following items are
              resolved:
            </p>

            <div className="mt-4 space-y-3">
              {commitments.map((commitment, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="mt-1">
                    <OctagonAlert
                      size={20}
                      strokeWidth={2}
                      absoluteStrokeWidth
                    />
                  </div>
                  <div>
                    <p className="text-fluid-xs font-semibold text-slate-800 dark:text-white">
                      {commitment.type
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, (char) => char.toUpperCase())}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      {commitment.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowCommitments(false)}
                className="px-4 py-2 bg-dark text-white rounded text-sm"
              >
                I understand, Go back
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
