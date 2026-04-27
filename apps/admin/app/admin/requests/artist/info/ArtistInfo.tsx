import { ArtistCategory } from "@omenai/shared-types";
import React, { useState } from "react";
import { SocialLinks } from "./Socials";
import CategorizationAnswers from "./CategorizationAnswers";
import { getGalleryLogoFileView } from "@omenai/shared-lib/storage/getGalleryLogoFileView";
import { VerificationInfoType } from "./ArtistInfoWrapper";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { acceptArtistVerification } from "@omenai/shared-services/admin/accept_artist_verification";
import { rejectArtistVerification } from "@omenai/shared-services/admin/reject_artist_verification";
import { Image } from "@mantine/core";
import { download_artist_resume } from "../../../lib/downloadResumeFile";
import { toast_notif } from "@omenai/shared-utils/src/toast_notification";
import {
  Download,
  CheckCircle2,
  XCircle,
  MapPin,
  Palette,
  AlertTriangle,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { useRollbar } from "@rollbar/react";
import { getOptimizedLogoImage } from "@omenai/shared-lib/storage/getImageFileView";

export default function ArtistInfo({ data }: { data: VerificationInfoType }) {
  const { artist, request } = data;
  const [recommendation, setRecommedation] = useState<ArtistCategory>(
    request.categorization.artist_categorization as ArtistCategory,
  );
  const [loadingType, setLoadingType] = useState<"accept" | "reject" | null>(
    null,
  );

  const { artist_id, name, email } = artist;
  const rollbar = useRollbar();
  const queryClient = useQueryClient();
  const router = useRouter();
  const { csrf } = useAuth({ requiredRole: "admin" });

  const handleFileDownload = () => {
    const file = artist.documentation?.cv;
    if (!file) {
      toast_notif("File ID not found", "error");
      return;
    }
    const file_download = download_artist_resume(file);
    if (!file_download) {
      toast_notif("Resume file not found", "error");
      return;
    }
    const a = document.createElement("a");
    a.href = file_download;
    a.download = `${artist.name} Resume`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleRequestAction = async (type: "accept" | "reject") => {
    try {
      setLoadingType(type);

      const response =
        type === "accept"
          ? await acceptArtistVerification(
              artist_id,
              recommendation,
              csrf || "",
            )
          : await rejectArtistVerification(
              artist_id,
              name,
              email as string,
              csrf || "",
            );

      if (!response.isOk) {
        toast_notif(response.message, "error");
        return;
      }

      toast_notif(response.message, "success");
      await queryClient.invalidateQueries({
        queryKey: ["fetch_artists_on_verif_status"],
      });
      router.replace("/admin/requests/artist");
    } catch (error) {
      if (error instanceof Error) {
        rollbar.error(error);
      } else {
        rollbar.error(new Error(String(error)));
      }
      toast_notif(
        "An error was encountered, please try again later or contact support",
        "error",
      );
    } finally {
      setLoadingType(null);
    }
  };

  const image_href = getOptimizedLogoImage(data.artist.logo as string, "small");

  const categoryOptions = [
    "Emerging",
    "Early Mid-Career",
    "Mid-Career",
    "Late Mid-Career",
    "Established",
    "Elite",
  ];

  const categoryTheme: Record<
    string,
    { bg: string; text: string; border: string; ring: string }
  > = {
    Emerging: {
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      border: "border-emerald-200",
      ring: "ring-emerald-500",
    },
    "Early Mid-Career": {
      bg: "bg-teal-50",
      text: "text-teal-700",
      border: "border-teal-200",
      ring: "ring-teal-500",
    },
    "Mid-Career": {
      bg: "bg-blue-50",
      text: "text-blue-700",
      border: "border-blue-200",
      ring: "ring-blue-500",
    },
    "Late Mid-Career": {
      bg: "bg-indigo-50",
      text: "text-indigo-700",
      border: "border-indigo-200",
      ring: "ring-indigo-500",
    },
    Established: {
      bg: "bg-purple-50",
      text: "text-purple-700",
      border: "border-purple-200",
      ring: "ring-purple-500",
    },
    Elite: {
      bg: "bg-rose-50",
      text: "text-rose-700",
      border: "border-rose-200",
      ring: "ring-rose-500",
    },
    Unknown: {
      bg: "bg-slate-50",
      text: "text-slate-700",
      border: "border-slate-200",
      ring: "ring-slate-500",
    },
  };

  const getTheme = (cat: string) => categoryTheme[cat] || categoryTheme.Unknown;

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8">
      <div className="mx-auto max-w-full space-y-6">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="relative h-32 w-full overflow-hidden bg-slate-50 border-b border-slate-100">
            <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-slate-200/40 blur-3xl"></div>
            <div className="absolute -bottom-10 right-20 h-40 w-40 rounded-full bg-slate-200/50 blur-3xl"></div>
          </div>

          <div className="px-6 pb-6 sm:px-8 sm:pb-8">
            <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              {/* Avatar & Basic Info */}
              <div className="-mt-16 flex flex-col sm:flex-row sm:items-end gap-5">
                {/* Square Avatar Wrapper */}
                <div className="relative inline-block shrink-0">
                  {image_href ? (
                    <Image
                      src={image_href}
                      className="h-32 w-32 rounded-2xl border-[5px] border-white bg-white object-cover shadow-md"
                      radius="16px"
                      alt={artist.name}
                    />
                  ) : (
                    <div className="flex h-32 w-32 items-center justify-center rounded-2xl border-[5px] border-white bg-gradient-to-br from-slate-800 to-dark text-3xl font-bold tracking-wider text-white shadow-md">
                      {artist.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                  )}
                  {/* Verified Badge shifted to fit the square corner perfectly */}
                  <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-emerald-500 text-white shadow-sm">
                    <ShieldCheck size={14} strokeWidth={2.5} />
                  </div>
                </div>

                {/* Name & Badges */}
                <div className="mb-1.5 space-y-3">
                  <h1 className="text-2xl font-bold tracking-tight text-dark">
                    {artist.name}
                  </h1>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-normal text-slate-600">
                      <Palette size={13} className="text-slate-400" />
                      {artist.art_style}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-normal text-slate-600">
                      <MapPin size={13} className="text-slate-400" />
                      {artist.address.state}, {artist.address.country}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 sm:mb-2">
                <button
                  onClick={handleFileDownload}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-normal text-slate-700 transition-colors hover:bg-slate-50 hover:text-dark focus:outline-none focus:ring-2 focus:ring-slate-200"
                >
                  <Download size={16} className="text-slate-400" />
                  Resume
                </button>
                <button
                  disabled={loadingType !== null}
                  onClick={() => handleRequestAction("reject")}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 text-sm font-normal text-red-700 transition-colors hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-200 disabled:opacity-50"
                >
                  {loadingType === "reject" ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <XCircle size={16} />
                  )}
                  Reject
                </button>
                <button
                  disabled={loadingType !== null}
                  onClick={() => handleRequestAction("accept")}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 text-sm font-normal text-white transition-all hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 shadow-sm"
                >
                  {loadingType === "accept" ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <CheckCircle2 size={16} />
                  )}
                  Accept Artist
                </button>
              </div>
            </div>

            {/* Socials Divider */}
            <div className="mt-8 border-t border-slate-100 pt-6">
              <SocialLinks socials={artist.documentation?.socials} />
            </div>
          </div>
        </div>

        {/* --- Main Content Split --- */}
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Left Column: Questionnaire Answers */}
          <div className="lg:col-span-7">
            <CategorizationAnswers answers={request?.categorization.answers} />
          </div>

          {/* Right Column: Category Assessment Tool */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-lg font-medium tracking-tight text-dark">
                Category Assessment
              </h2>

              {/* Status Metric Cards */}
              <div className="mb-8 grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Algorithm Result
                  </p>
                  <span
                    className={`inline-flex rounded-md border px-2.5 py-1 text-xs font-medium ${getTheme(request?.categorization.artist_categorization as string).bg} ${getTheme(request?.categorization.artist_categorization as string).text} ${getTheme(request?.categorization.artist_categorization as string).border}`}
                  >
                    {request?.categorization.artist_categorization}
                  </span>
                </div>
                <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4">
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-blue-600">
                    Final Selection
                  </p>
                  <span
                    className={`inline-flex rounded-md border px-2.5 py-1 text-xs font-medium ${getTheme(recommendation).bg} ${getTheme(recommendation).text} ${getTheme(recommendation).border}`}
                  >
                    {recommendation}
                  </span>
                </div>
              </div>

              {/* Interactive Category Selector */}
              <div>
                <h3 className="mb-3 text-sm font-normal text-dark">
                  Override Category
                </h3>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {categoryOptions.map((category) => {
                    const isSelected = recommendation === category;
                    const theme = getTheme(category);

                    return (
                      <button
                        key={category}
                        onClick={() =>
                          setRecommedation(category as ArtistCategory)
                        }
                        className={`relative flex items-center justify-between rounded-xl border p-3 text-left text-sm font-normal transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                          isSelected
                            ? `${theme.bg} ${theme.border} ${theme.text} ${theme.ring} ring-2 ring-offset-0`
                            : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        {category}
                        {isSelected && (
                          <CheckCircle2 size={16} className={theme.text} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Warning Callout (Only shows if overriding algorithm) */}
              {recommendation !==
                request?.categorization.artist_categorization && (
                <div className="mt-6 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <AlertTriangle
                    className="mt-0.5 shrink-0 text-amber-500"
                    size={18}
                  />
                  <div>
                    <h4 className="text-sm font-normal text-amber-800">
                      Manual Override Active
                    </h4>
                    <p className="mt-1 text-xs leading-relaxed text-amber-700">
                      You are assigning this artist to{" "}
                      <strong className="font-medium">{recommendation}</strong>{" "}
                      instead of the algorithm's recommendation of{" "}
                      <strong className="font-medium">
                        {request?.categorization.artist_categorization}
                      </strong>
                      .
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
