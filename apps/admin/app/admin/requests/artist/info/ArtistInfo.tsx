import { ArtistCategory } from "@omenai/shared-types";
import React, { useState } from "react";
import { SocialLinks } from "./Socials";
import CategorizationAnswers from "./CategorizationAnswers";
import { toast } from "sonner";
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
  CheckCircle,
  XCircle,
  MapPin,
  Palette,
  AlertCircle,
} from "lucide-react";
import error from "../../../../error";

export default function ArtistInfo({ data }: { data: VerificationInfoType }) {
  const { artist, request } = data;
  const [recommendation, setRecommedation] = useState<ArtistCategory>(
    request.categorization.artist_categorization as ArtistCategory
  );
  const [loading, setLoading] = useState(false);
  const { artist_id, name, email } = artist;
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
    a.download = `${artist.name} resume`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleRequestAction = async (type: "accept" | "reject") => {
    try {
      setLoading(true);

      const response =
        type === "accept"
          ? await acceptArtistVerification(
              artist_id,
              recommendation,
              csrf || ""
            )
          : await rejectArtistVerification(artist_id, name, email, csrf || "");

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
      toast_notif(
        "An error was encountered, please try again later or contact support",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const image_href = getGalleryLogoFileView(data!.artist!.logo, 300);

  const categoryOptions = [
    "Emerging",
    "Early Mid-Career",
    "Mid-Career",
    "Late Mid-Career",
    "Established",
    "Elite",
  ];

  const getCategoryColor = (category: ArtistCategory | "Unknown") => {
    const colors = {
      Emerging: "bg-green-500",
      "Early Mid-Career": "bg-yellow-500",
      "Mid-Career": "bg-orange-500",
      "Late Mid-Career": "bg-purple-500",
      Established: "bg-blue-500",
      Elite: "bg-pink-500",
      Unknown: "bg-gray-500",
    };
    return colors[category] || "bg-gray-500";
  };

  const getCategoryBgColor = (category: ArtistCategory | "Unknown") => {
    const colors = {
      Emerging: "bg-green-50 border-green-200",
      "Early Mid-Career": "bg-yellow-50 border-yellow-200",
      "Mid-Career": "bg-orange-50 border-orange-200",
      "Late Mid-Career": "bg-purple-50 border-purple-200",
      Established: "bg-blue-50 border-blue-200",
      Elite: "bg-pink-50 border-pink-200",
      Unknown: "bg-gray-50 border-gray-200",
    };
    return colors[category] || "bg-gray-50 border-gray-200";
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 2xl:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-4">
          {/* Banner */}
          <div className="h-32 bg-gradient-to-br from-gray-900 to-gray-700 relative">
            <div className="absolute inset-0 bg-black/20"></div>
          </div>

          <div className="px-4 pb-4">
            {/* Profile Section */}
            <div className="flex flex-col md:flex-row gap-6 -mt-16 relative">
              {/* Avatar */}
              <div className="flex-shrink-0">
                {image_href ? (
                  <div className="relative">
                    <Image
                      src={image_href}
                      className="rounded-full border-4 border-white shadow-xl"
                      h={100}
                      w={100}
                      radius="100%"
                    />
                    <div className="absolute bottom-0 right-0 w-8 h-8 bg-emerald-500 rounded-full border-4 border-white flex items-center justify-center">
                      <CheckCircle size={14} className="text-white" />
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="w-32 h-32 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full border-4 border-white shadow-xl flex items-center justify-center text-white text-fluid-lg 2xl:text-fluid-xl font-semibold">
                      {artist.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 bg-emerald-500 rounded-full border-4 border-white flex items-center justify-center">
                      <CheckCircle size={16} className="text-white" />
                    </div>
                  </div>
                )}
              </div>

              {/* Artist Info */}
              <div className="flex-1 pt-4">
                <h1 className="text-fluid-lg 2xl:text-fluid-xl font-semibold text-white mb-2">
                  {artist.name}
                </h1>

                <div className="flex flex-wrap gap-3 mb-4">
                  <div className="inline-flex items-center gap-2 px-4 bg-blue-50 text-blue-700 rounded-full text-fluid-xs font-normal border border-blue-200">
                    <Palette size={14} />
                    {artist.art_style}
                  </div>
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full text-fluid-xs font-normal border border-green-200">
                    <MapPin size={14} />
                    {artist.address.state}, {artist.address.country}
                  </div>
                </div>

                <div className="mb-6">
                  <SocialLinks socials={artist.documentation?.socials} />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleFileDownload}
                    className="inline-flex items-center gap-2 px-4 text-fluid-xs py-2 bg-gray-900 text-white hover:text-dark rounded-lg font-medium hover:bg-gray-800 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    <Download size={14} />
                    Download Resume
                  </button>
                  <button
                    disabled={loading}
                    onClick={() => handleRequestAction("accept")}
                    className="inline-flex items-center gap-2 px-4 text-fluid-xs py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <CheckCircle size={14} />
                    )}
                    Accept Artist
                  </button>
                  <button
                    disabled={loading}
                    onClick={() => handleRequestAction("reject")}
                    className="inline-flex items-center gap-2 px-4 text-fluid-xs py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <XCircle size={14} />
                    )}
                    Reject Artist
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Categorization Answers */}
          <CategorizationAnswers answers={request?.categorization.answers} />

          {/* Category Recommendation Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-fluid-md font-bold text-gray-900 mb-6">
              Category Assessment
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Algorithm Recommendation */}
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <h3 className="text-fluid-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">
                  Algorithm Recommendation
                </h3>
                <div
                  className={`inline-flex items-center px-4 py-2 ${getCategoryColor(request?.categorization.artist_categorization)} text-white rounded-lg text-fluid-xs font-medium shadow-md`}
                >
                  {request?.categorization.artist_categorization}
                </div>
              </div>

              {/* Current Selection */}
              <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                <h3 className="text-fluid-xs font-semibold text-blue-600 uppercase tracking-wider mb-3">
                  Selected Category
                </h3>
                <div
                  className={`inline-flex items-center px-4 py-2 text-fluid-xs ${getCategoryColor(recommendation)} text-white rounded-lg font-medium shadow-md`}
                >
                  {recommendation}
                </div>
              </div>
            </div>

            {/* Category Selection Grid */}
            <div className="mt-8">
              <h4 className="text-fluid-sm font-semibold text-gray-700 mb-4">
                Update Category Selection
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {categoryOptions.map((category) => (
                  <button
                    key={category}
                    onClick={() => setRecommedation(category as ArtistCategory)}
                    className={`relative p-3 rounded-xl text-fluid-xs font-medium transition-all duration-200 ${
                      recommendation === category
                        ? `${getCategoryColor(category)} text-white shadow-lg scale-105`
                        : `${getCategoryBgColor(category as ArtistCategory)} hover:scale-102 border`
                    }`}
                  >
                    {recommendation === category && (
                      <div className="absolute top-2 right-2">
                        <CheckCircle size={16} />
                      </div>
                    )}
                    {category}
                  </button>
                ))}
              </div>

              {/* Warning Message */}
              {recommendation !==
                request?.categorization.artist_categorization && (
                <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                  <AlertCircle
                    className="text-amber-600 flex-shrink-0 mt-0.5"
                    size={20}
                  />
                  <div>
                    <p className="text-amber-800 font-medium text-fluid-xs">
                      Category will be updated
                    </p>
                    <p className="text-amber-700 text-fluid-xs">
                      The artist will be categorized as{" "}
                      <strong>{recommendation}</strong> instead of the
                      recommended{" "}
                      <strong>
                        {request?.categorization.artist_categorization}
                      </strong>
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
