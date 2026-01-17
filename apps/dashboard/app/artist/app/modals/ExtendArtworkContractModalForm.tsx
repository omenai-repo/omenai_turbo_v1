"use client";

import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { artistActionStore } from "@omenai/shared-state-store/src/artist/actions/ActionStore";
import { toast_notif } from "@omenai/shared-utils/src/toast_notification";
import { CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { extendArtworkExclusivity } from "@omenai/shared-services/artworks/extendArtworkExclusivity";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { LoadSmall } from "@omenai/shared-ui-components/components/loader/Load";
import { useRollbar } from "@rollbar/react";
export default function ExtendArtworkContractConfirmationModalForm() {
  const [acknowledgment, setAcknowledgment] = useState(false);
  const [penaltyConsent, setPenaltyConsent] = useState(false);
  const rollbar = useRollbar();
  const [loading, setLoading] = useState(false);
  const isFormValid = acknowledgment && penaltyConsent;
  const { csrf } = useAuth({ requiredRole: "artist" });

  const { exclusivityExtendModal, toggleExclusivityExtendModal } =
    artistActionStore();

  const queryClient = useQueryClient();
  const router = useRouter();

  const handleExtension = async () => {
    setLoading(true);
    try {
      if (!isFormValid) {
        toast_notif("All agreements need to be accepted to proceed", "error");
        return;
      }

      if (!exclusivityExtendModal.art_id) {
        toast_notif(
          "Resource data `art_id` is missing, re-open modal form. If issue persists, please contact support",
          "error"
        );
        return;
      }

      const extend_contract = await extendArtworkExclusivity(
        exclusivityExtendModal.art_id,
        csrf || ""
      );

      if (!extend_contract.isOk) {
        toast_notif(extend_contract.message, "error");
        return;
      }

      toast_notif(extend_contract.message, "success");

      //   Refresh query

      await queryClient.invalidateQueries({
        queryKey: ["fetch_artworks_by_id"],
      });
      router.refresh();
      toggleExclusivityExtendModal(false, "");
    } catch (error) {
      if (error instanceof Error) {
        rollbar.error(error);
      } else {
        rollbar.error(new Error(String(error)));
      }
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="space-y-3">
        <h1 className="text-fluid-md font-bold text-dark tracking-tight">
          Extend Artwork Exclusivity Contract
        </h1>
        <p className="text-fluid-xs text-dark/60 leading-relaxed">
          Review and accept the terms below to renew your artwork's 90-day
          exclusivity period.
        </p>
      </div>

      {/* Notice Card */}
      <div className="relative bg-dark rounded p-4 text-white shadow-lg overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded -mr-16 -mt-16" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded -ml-12 -mb-12" />
        <div className="relative flex items-start gap-2">
          <div className="flex-shrink-0 w-10 h-10 bg-white/20 backdrop-blur-sm rounded flex items-center justify-center">
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-base mb-1">Contract Extension</h3>
            <p className="text-fluid-xs text-white/90">
              This action will renew the 90-day exclusivity period, starting
              from today.
            </p>
          </div>
        </div>
      </div>

      {/* Terms Section */}
      <div className="space-y-2">
        <h3 className="text-fluid-base font-semibold text-dark flex items-center gap-2">
          <span className="w-1 h-5 bg-dark rounded" /> Agreement Terms
        </h3>

        <div className="space-y-2">
          <label
            aria-label="90-day exclusivity period"
            htmlFor="90-day exclusivity period"
            className="group block"
          >
            <div className="relative bg-white border-2 border-dark/10 rounded p-4 cursor-pointer transition-all duration-200 hover:border-dark/30 hover:shadow-md has-[:checked]:border-dark has-[:checked]:bg-dark/5 has-[:checked]:shadow-lg">
              <div className="flex items-start gap-2">
                <input
                  name="90-day exclusivity period"
                  type="checkbox"
                  checked={acknowledgment}
                  onChange={(e) => setAcknowledgment(e.target.checked)}
                  className="mt-0.5 h-5 w-5 rounded border-2 border-dark/30 text-dark focus:ring-2 focus:ring-dark focus:ring-offset-2 cursor-pointer transition-all"
                />
                <div className="flex-1">
                  <p className="text-fluid-xxs text-dark leading-relaxed">
                    I acknowledge that this artwork will be subject to a{" "}
                    <span className="font-semibold text-dark">
                      90-day exclusivity period
                    </span>{" "}
                    with Omenai and cannot be sold through external channels
                    during this time.
                  </p>
                </div>
              </div>
            </div>
          </label>

          <label
            aria-label=" 10% penalty fee"
            htmlFor=" 10% penalty fee"
            className="group block"
          >
            <div className="relative bg-white border-2 border-dark/10 rounded p-4 cursor-pointer transition-all duration-200 hover:border-dark/30 hover:shadow-md has-[:checked]:border-dark has-[:checked]:bg-dark/5 has-[:checked]:shadow-lg">
              <div className="flex items-start gap-2">
                <input
                  name="10% penalty fee"
                  type="checkbox"
                  checked={penaltyConsent}
                  onChange={(e) => setPenaltyConsent(e.target.checked)}
                  className="mt-0.5 h-5 w-5 rounded border-2 border-dark/30 text-dark focus:ring-2 focus:ring-dark focus:ring-offset-2 cursor-pointer transition-all"
                />
                <div className="flex-1">
                  <p className="text-fluid-xxs text-dark leading-relaxed">
                    I understand that any breach of this exclusivity agreement
                    will result in a{" "}
                    <span className="font-semibold text-dark">
                      10% penalty fee
                    </span>{" "}
                    deducted from my next successful sale on the platform.
                  </p>
                </div>
              </div>
            </div>
          </label>
        </div>
      </div>

      <div className="flex items-center justify-center text-fluid-xxs text-slate-700 gap-2">
        <span
          className={`flex items-center gap-1 ${
            acknowledgment ? "text-emerald-600" : "text-gray-400"
          }`}
        >
          <CheckCircle2 className="w-3 h-3" /> Acknowledged
        </span>
        <span>|</span>
        <span
          className={`flex items-center gap-1 ${
            penaltyConsent ? "text-emerald-600" : "text-gray-400"
          }`}
        >
          <CheckCircle2 className="w-3 h-3" /> Penalty Consent
        </span>
      </div>

      {/* Action Button */}
      <div className="pt-2">
        <button
          disabled={!isFormValid || loading}
          onClick={handleExtension}
          className="group relative w-full h-10 bg-gradient-to-r from-dark via-dark to-dark/90 hover:from-dark/90 hover:via-dark hover:to-dark text-white rounded text-fluid-xs shadow-xl hover:shadow-2xl disabled:from-dark/20 disabled:via-dark/20 disabled:to-dark/20 disabled:text-gray-400 disabled:shadow-none transition-all duration-300 overflow-hidden disabled:cursor-not-allowed grid place-items-center"
        >
          {loading ? (
            <LoadSmall />
          ) : (
            <>
              <span className="relative z-10 flex items-center justify-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Confirm & Extend Contract
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            </>
          )}
        </button>

        {!isFormValid && (
          <p className="text-center text-fluid-xs text-dark/90 mt-4 animate-pulse">
            Please accept both terms to continue
          </p>
        )}
      </div>
    </div>
  );
}
