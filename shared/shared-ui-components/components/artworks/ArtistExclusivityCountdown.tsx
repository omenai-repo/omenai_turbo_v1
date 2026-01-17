"use client";
import { useEffect, useMemo } from "react";
import { useTimer } from "react-timer-hook";
import { artistActionStore } from "@omenai/shared-state-store/src/artist/actions/ActionStore";

interface ExclusivityCountdownProps {
  expiresAt: string | Date;
  art_id: string;
  onExpire?: () => void;
}

export default function ArtistExclusivityCountdown({
  expiresAt,
  art_id,
  onExpire,
}: ExclusivityCountdownProps) {
  if (!expiresAt) return null;

  const expiryDate = useMemo(
    () => (typeof expiresAt === "string" ? new Date(expiresAt) : expiresAt),
    [expiresAt]
  );

  const { seconds, minutes, hours, days, isRunning } = useTimer({
    expiryTimestamp: expiryDate,
    autoStart: true,
    onExpire: async () => {
      onExpire?.();
    },
  });

  const formatTime = (value: number) => String(value).padStart(2, "0");
  const { toggleExclusivityExtendModal } = artistActionStore();

  const handleExtension = () => {
    toggleExclusivityExtendModal(true, art_id);
  };

  return (
    <div className="w-full" aria-live="polite">
      {isRunning ? (
        <div className="bg-gradient-to-r from-dark/5 to-dark/10 rounded p-3 border border-dark/10">
          <div className="flex flex-col items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded animate-pulse" />
              <span className="text-dark/70 text-fluid-xxs font-medium">
                Exclusivity contract ends in:
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {days > 0 && (
                <div className="bg-white rounded px-2 py-1 min-w-[36px] text-center shadow-sm">
                  <span className="text-dark font-semibold text-fluid-xxs">
                    {formatTime(days)}
                  </span>
                  <span className="text-dark/50 text-[10px] ml-0.5">D</span>
                </div>
              )}
              <div className="bg-white rounded px-2 py-1 min-w-[36px] text-center shadow-sm">
                <span className="text-dark font-semibold text-fluid-xxs">
                  {formatTime(hours)}
                </span>
                <span className="text-dark/50 text-[10px] ml-0.5">H</span>
              </div>
              <div className="bg-white rounded px-2 py-1 min-w-[36px] text-center shadow-sm">
                <span className="text-dark font-semibold text-fluid-xxs">
                  {formatTime(minutes)}
                </span>
                <span className="text-dark/50 text-[10px] ml-0.5">M</span>
              </div>
              <div className="bg-white rounded px-2 py-1 min-w-[36px] text-center shadow-sm">
                <span className="text-dark font-semibold text-fluid-xxs">
                  {formatTime(seconds)}
                </span>
                <span className="text-dark/50 text-[10px] ml-0.5">S</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-200 rounded p-3">
          <div className="flex items-start gap-2 mb-3">
            <svg
              className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-amber-800 text-fluid-xxs leading-relaxed">
              Artwork Exclusivity period has ended.
            </p>
          </div>
          <button
            onClick={handleExtension}
            className="w-full bg-dark hover:bg-dark/90 text-white text-fluid-xxs font-medium py-2 px-4 rounded transition-all duration-200 shadow-sm hover:shadow"
            aria-label="Extend exclusivity contract"
          >
            Extend exclusivity contract
          </button>
        </div>
      )}
    </div>
  );
}
