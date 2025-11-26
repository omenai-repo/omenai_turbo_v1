"use client";
import { useState, useEffect } from "react";
import {
  CheckCircle,
  AlertTriangle,
  ChevronRight,
  Loader2,
  Info,
} from "lucide-react";
import { StepComponentProps } from "../OnboardingContainer";
import { artistOnboardingStore } from "@omenai/shared-state-store/src/artist/onboarding/ArtistOnboardingStateStore";
import { validateOnboarding } from "../validateOnboarding";
import uploadArtistDocument from "../uploadArtistDocs";
import { ArtistCategorizationUpdateDataTypes } from "@omenai/shared-types";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { onboardArtist } from "@omenai/shared-services/onboarding/onboardArtist";
import { storage } from "@omenai/appwrite-config";
import { toast_notif } from "@omenai/shared-utils/src/toast_notification";
import { useRollbar } from "@rollbar/react";
import { dashboard_url } from "@omenai/url-config/src/config";

type Option = "yes" | "no";

export default function ConfirmationStep({
  question,
  updateData,
  goBack,
  isFirstStep,
}: StepComponentProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [startTimer, setStartTimer] = useState(false);

  const { onboardingData, clearData } = artistOnboardingStore();

  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    if (!isSubmitted || !startTimer) return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          window.location.href = `${dashboard_url()}/artist/app/overview`;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isSubmitted, startTimer]);

  // Use a minimal placeholder for question if not provided in this context
  const stepQuestion = question || "Confirm Your Information";

  const { user, csrf } = useAuth({ requiredRole: "artist" });

  const rollbar = useRollbar();

  const handleSubmit = async () => {
    if (!isConfirmed) return;

    const isValidated = validateOnboarding(onboardingData);
    if (!isValidated) return;

    const {
      socials,
      cv,
      biennale,
      museum_collection,
      museum_exhibition,
      solo,
      group,
      bio,
      mfa,
      art_fair,
      graduate,
    } = onboardingData;

    try {
      setIsSubmitting(true);

      const fileUploaded = await uploadArtistDocument(cv as File);

      if (fileUploaded) {
        let file: { bucketId: string; fileId: string } = {
          bucketId: fileUploaded.bucketId,
          fileId: fileUploaded.$id,
        };

        const payload: ArtistCategorizationUpdateDataTypes = {
          documentation: { cv: file.fileId, socials },
          answers: {
            graduate: graduate as Option,
            mfa: mfa as Option,
            solo: Number(solo),
            group: Number(group),
            museum_collection: museum_collection as Option,
            biennale: biennale as
              | "venice"
              | "none"
              | "other recognized biennale events",
            museum_exhibition: museum_exhibition as Option,
            art_fair: art_fair as Option,
          },
          bio,
          artist_id: user.artist_id,
        };

        const response = await onboardArtist(payload, csrf as string);

        if (response.isOk) {
          toast_notif(
            "Your verification request has been sent successfully",
            "success"
          );

          clearData();
          setIsSubmitted(true);
          setStartTimer(true);
        } else {
          await storage.deleteFile({
            bucketId: process.env.NEXT_PUBLIC_APPWRITE_DOCUMENTATION_BUCKET_ID!,
            fileId: file.fileId,
          });
          toast_notif(response.message, "error");
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        rollbar.error(error);
      } else {
        rollbar.error(new Error(String(error)));
      }
      toast_notif(
        "Something went wrong. Please contact customer support",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted && startTimer) {
    return (
      <div className="text-center p-10 flex flex-col items-center space-y-6">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-2 animate-pulse" />

        <h2 className="text-fluid-sm font-bold text-dark">
          Verification Process Started!
        </h2>

        <p className="text-gray-600 max-w-lg mx-auto text-fluid-xs">
          Your profile has been submitted for verification. We will
          cross-reference the information you provided to ensure accuracy.
          You’ll be notified once the verification review is complete.
        </p>

        {/* COUNTDOWN DISPLAY */}
        <div className="mt-6 flex flex-col items-center">
          {/* Circular Progress Countdown */}
          <div className="relative w-24 h-24">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="50%"
                cy="50%"
                r="36"
                stroke="#e5e7eb"
                strokeWidth="6"
                fill="transparent"
              />
              <circle
                cx="50%"
                cy="50%"
                r="36"
                stroke="#6b7280"
                strokeWidth="6"
                fill="transparent"
                strokeDasharray={`${2 * Math.PI * 36}`}
                strokeDashoffset={`${
                  (countdown / 10) * (2 * Math.PI * 36)
                }`} /* if 10 seconds */
                className="transition-all duration-1000 ease-linear"
                strokeLinecap="round"
              />
            </svg>

            {/* The number inside */}
            <span className="absolute inset-0 flex items-center justify-center text-dark font-semibold text-lg animate-[fadeIn_1s_ease-in-out]">
              {countdown}
            </span>
          </div>

          <p className="mt-3 text-fluid-xs text-gray-600">
            Redirecting in{" "}
            <span className="font-semibold text-dark">{countdown}</span>{" "}
            seconds…
          </p>
        </div>
      </div>
    );
  }

  // Main confirmation view
  return (
    <div className="flex flex-col items-center">
      <CheckCircle className="w-12 h-12 text-purple-500 mb-4" />
      <h2 className="text-fluid-xs font-normal text-slate-700 mb-2 text-center">
        {stepQuestion}
      </h2>
      <p className="text-slate-700 text-fluid-xs mb-8 max-w-lg text-center">
        Please confirm that all the information you have provided in the
        previous steps is accurate and up-to-date.
      </p>

      {/* Verification Warning Box */}
      <div className="w-full max-w-lg p-4 bg-yellow-50 border border-yellow-200 rounded mb-8 shadow-md">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="w-6 h-6 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-yellow-800">
              Verification Warning
            </h3>
            <p className="text-fluid-xs text-yellow-700 mt-1">
              Providing false, misleading, or unverifiable information (e.g.,
              exhibitions, awards, education) could severely affect your
              verification status and may lead to the rejection of your
              application. Ensure all details are accurate to avoid delays.
            </p>
          </div>
        </div>
      </div>

      {/* Confirmation Checkbox */}
      <div className="w-full max-w-lg flex items-start space-x-3 p-4 bg-gray-50 rounded border border-slate-200">
        <input
          type="checkbox"
          id="confirmation"
          checked={isConfirmed}
          onChange={(e) => setIsConfirmed(e.target.checked)}
          className="mt-1 w-5 h-5 text-dark bg-slate-200 border-slate-200 rounded focus:ring-dark"
        />
        <label
          htmlFor="confirmation"
          className="text-fluid-xs text-slate-700 cursor-pointer"
        >
          I confirm that all statements and data provided throughout this
          onboarding journey are true, accurate, and verifiable.
        </label>
      </div>

      {/* Navigation and Submission */}
      <div className="flex justify-between w-full max-w-lg mt-10">
        <button
          onClick={goBack}
          disabled={isFirstStep || isSubmitting}
          className="flex items-center text-slate-700 hover:text-slate-900 text-fluid-xs disabled:opacity-50 transition duration-150"
        >
          {/* Using Info icon to signify reviewing the previous data */}
          <Info className="w-5 h-5 mr-1" /> Review Previous Steps
        </button>
        <button
          onClick={handleSubmit}
          disabled={!isConfirmed || isSubmitting}
          className={`px-4 py-2 rounded text-fluid-xs flex items-center text-white font-normal transition duration-300 ${
            isConfirmed && !isSubmitting
              ? "bg-slate-800 shadow-lg hover:shadow-xl hover:bg-dark"
              : "bg-slate-300 cursor-not-allowed"
          }`}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Submitting...
            </>
          ) : (
            <>
              Submit for Verification <ChevronRight className="w-5 h-5 ml-1" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
