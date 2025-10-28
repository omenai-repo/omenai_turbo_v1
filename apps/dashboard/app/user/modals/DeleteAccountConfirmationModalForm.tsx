import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { deleteAccount } from "@omenai/shared-services/requests/deleteAccount";
import { actionStore } from "@omenai/shared-state-store/src/actions/ActionStore";
import React, { useState } from "react";
import DeleteAccountSuccessModal from "./DeleteAccountSuccessModal";
import DeleteAccountCommitmentModal from "./DeleteAccountCommitmentModal";
type Commitment = {
  type: string;
  description: string;
  metadata?: Record<string, any>;
};

const reasonsMap = [
  "Privacy concerns",
  "Found a better alternative",
  "Too expensive",
  "Lack of Features",
  "Other",
];

export default function DeleteAccountConfirmationModalForm() {
  const { updateDeleteUserAccountModalPopup, deleteUserAccountModal } =
    actionStore();
  const { user, csrf, signOut } = useAuth({ requiredRole: "user" });
  const [reason, setReason] = useState<string>("");
  const [otherText, setOtherText] = useState("");

  const [loading, setLoading] = useState(false);
  const [commitments, setCommitments] = useState<Commitment[] | null>(null);
  const [showCommitments, setShowCommitments] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function confirmDeletion() {
    setLoading(true);
    setError(null);
    setCommitments(null);
    try {
      const payload = {
        id: user.user_id,
        reason: reason.toLowerCase() === "other" ? otherText : reason,
      };

      const response = await deleteAccount(
        "individual",
        payload.id,
        payload.reason,
        csrf || ""
      );

      if (response.status === 409) {
        // commitments returned
        const commitmentsList: Commitment[] =
          response.commitments?.commitments || response.commitments || [];
        setCommitments(commitmentsList);
        setShowCommitments(true);
        setLoading(false);
        return;
      }

      if (response.status === 202 || response.isOk) {
        setShowCommitments(false);
        setShowSuccess(true);
        setLoading(false);
        return;
      }

      // fallback error
      setError(response.message || "Unable to process deletion request");
    } catch (err: any) {
      setError(
        err?.message ||
          "Network error encountered, please try again or contact support"
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await signOut();
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          onClick={() => updateDeleteUserAccountModalPopup(false)}
        />

        <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-3xl mx-auto p-6 md:p-8 z-10 overflow-y-auto max-h-[90vh] scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600">
          <div className="flex gap-4 items-start">
            <div className="flex-shrink-0">
              {/* Sad icon */}
              <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 10h.01M15 10h.01M12 20c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9.5 15.5C10.667 14.333 13.333 14.333 14.5 15.5"
                  />
                </svg>
              </div>
            </div>

            <div className="flex-1">
              <h3 className="text-fluid-sm font-semibold text-slate-900 dark:text-white">
                Delete your Omenai account
              </h3>
              <p className="mt-1 text-fluid-xs text-slate-600 dark:text-slate-300">
                This will remove your access to the platform and delete your
                data after a 30-day grace period.
              </p>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="space-y-3">
                  <h4 className="text-fluid-xs font-medium text-slate-700 dark:text-slate-200">
                    Why are you leaving? (select any)
                  </h4>
                  {reasonsMap.map((selectReason, k) => (
                    <label
                      key={k}
                      className="flex items-center gap-3 text-fluid-xs"
                    >
                      <input
                        type="checkbox"
                        checked={reason === selectReason}
                        onChange={() => setReason(selectReason)}
                        className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="capitalize text-slate-700 dark:text-slate-200">
                        {selectReason}
                      </span>
                    </label>
                  ))}

                  {reason === "Other" && (
                    <input
                      placeholder="Tell us briefly"
                      value={otherText}
                      onChange={(e) => setOtherText(e.target.value)}
                      className="mt-2 w-full max-w-[300px] rounded border px-3 py-2 text-fluid-xs placeholder:text-fluid-xxs bg-slate-50 dark:bg-slate-700"
                    />
                  )}
                </div>

                <div className="space-y-3">
                  <h4 className="text-fluid-xs font-medium text-slate-700 dark:text-slate-200">
                    What happens next
                  </h4>
                  <ul className="text-fluid-xs text-slate-600 dark:text-slate-300 space-y-2 list-disc list-inside">
                    <li>
                      We will check for any outstanding commitments (Orders paid
                      for and processing).
                    </li>
                    <li>
                      If there are outstanding commitments, deletion won’t start
                      — we’ll show what needs responseolving.
                    </li>
                    <li>
                      Your account will be retained for <strong>30 days</strong>
                      . You can log in to reactivate during this period.
                    </li>
                    <li>
                      After the grace period, all data will be permanently
                      removed. See our{" "}
                      <a href="/privacy" className="text-indigo-600 underline">
                        privacy policy
                      </a>{" "}
                      for details.
                    </li>
                  </ul>
                </div>
              </div>

              {/* Bottom actions */}
              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  disabled={loading}
                  onClick={() => updateDeleteUserAccountModalPopup(false)}
                  className="px-4 py-2 rounded border border-slate-200 disabled:opacity-60 disabled:cursor-not-allowed text-fluid-xs text-slate-700 bg-white hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeletion}
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 disabled:cursor-not-allowed text-white rounded text-fluid-xs hover:bg-red-700 disabled:opacity-60"
                >
                  {loading ? (
                    <svg
                      className="w-4 h-4 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <path
                        d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : null}
                  Continue to delete
                </button>
              </div>

              {error && (
                <p className="mt-3 text-fluid-xs text-red-600">{error}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Commitments modal */}
      {showCommitments && commitments && (
        <DeleteAccountCommitmentModal
          commitments={commitments}
          setShowCommitments={setShowCommitments}
        />
      )}

      {/* Success modal */}
      {showSuccess && <DeleteAccountSuccessModal />}
    </>
  );
}
