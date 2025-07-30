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
        toast.error("Error notification ", {
          description: response.message,
          style: {
            background: "red",
            color: "white",
          },
          className: "class",
        });
        return;
      }

      toast.success("Operation successful ", {
        description: response.message,
        style: {
          background: "green",
          color: "white",
        },
        className: "class",
      });
      await queryClient.invalidateQueries({
        queryKey: ["fetch_artists_on_verif_status"],
      });
      router.replace("/admin/requests/artist");
    } catch (error) {
      toast.error("Error notification ", {
        description:
          "An error was encountered, please try later or contact support",
        style: {
          background: "red",
          color: "white",
        },
        className: "class",
      });
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
      Emerging: "from-green-400 to-emerald-500",
      "Early Mid-Career": "from-yellow-400 to-amber-500",
      "Mid-Career": "from-orange-400 to-red-500",
      "Late Mid-Career": "from-purple-400 to-violet-500",
      Established: "from-blue-400 to-indigo-500",
      Elite: "from-pink-400 to-rose-500",
      Unknown: "from-gray-400 to-gray-500",
    };
    return colors[category] || "from-gray-400 to-gray-500";
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-5xl">
        {/* Header Card */}
        <div className="bg-white rounded-3xl p-8 mb-8 border backdrop-blur-sm">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            {/* Avatar */}
            {image_href ? (
              <div className="relative group">
                <Image
                  src={image_href}
                  className="rounded-xl shadow-lg"
                  h={100}
                  w={100}
                  radius={"100%"}
                />
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-xl border-4 border-white flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              </div>
            ) : (
              <div className="relative group">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-400 via-pink-400 to-red-400 rounded-xl flex items-center justify-center text-white text-2xl font-bold shadow-xl group- transition-transform duration-300">
                  {artist.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-xl border-4 border-white flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              </div>
            )}

            {/* Artist Info */}
            <div className="flex-1 space-y-3">
              <div>
                <h1 className="text-2xl font-bold bg-dark bg-clip-text text-transparent">
                  {artist.name}
                </h1>
                <div className="flex flex-wrap gap-4 mt-2">
                  <span className="px-3 py-1 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 rounded-xl text-sm font-medium">
                    🎨 {artist.art_style}
                  </span>
                  <span className="px-3 py-1 bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 rounded-xl text-sm font-medium">
                    📍 {artist.address.state}, {artist.address.country}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <SocialLinks socials={artist.documentation?.socials} />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 mt-4 pt-4 border-gray-100">
            <button className="px-4 py-2 bg-dark text-white rounded-md font-medium hover:shadow-lg text-fluid-xs transition-all duration-300 ">
              📄 Download Resume
            </button>
            <button
              disabled={loading}
              onClick={() => handleRequestAction("accept")}
              className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-md font-medium hover:shadow-lg text-fluid-xs transition-all duration-300  disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? "⏳" : "✅"} Accept Artist
            </button>
            <button
              disabled={loading}
              onClick={() => handleRequestAction("reject")}
              className="px-4 py-2 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-md font-medium hover:shadow-lg text-fluid-xs transition-all duration-300  disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? "⏳" : "❌"} Reject Artist
            </button>
          </div>
        </div>

        {/* Artist Information Card */}
        <div className="bg-white rounded-3xl shadow-blue-100/50 border border-white/50 backdrop-blur-sm">
          {/* Categorization Answers */}
          <div className="">
            <CategorizationAnswers answers={request?.categorization.answers} />
          </div>

          {/* Category Recommendation */}
          <div className="space-y-6 my-5">
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-6 rounded-2xl border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-700 mb-3">
                Algorithm Recommendation
              </h3>
              <div
                className={`inline-flex px-4 py-2 bg-gradient-to-r ${getCategoryColor(request?.categorization.artist_categorization)} text-white rounded-md font-semibold text-fluid-base shadow-lg`}
              >
                {request?.categorization.artist_categorization}
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border-2 border-dashed border-gray-200">
              <h4 className="text-lg font-semibold text-gray-700 mb-4">
                Update Artist Category
              </h4>
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {categoryOptions.map((category) => (
                    <button
                      key={category}
                      onClick={() =>
                        setRecommedation(category as ArtistCategory)
                      }
                      className={`p-3 rounded-md text-sm font-medium transition-all duration-300 ${
                        recommendation === category
                          ? `bg-gradient-to-r ${getCategoryColor(category)} text-white shadow-lg scale-105`
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-102"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
                {recommendation !==
                  request?.categorization.artist_categorization && (
                  <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-md">
                    <p className="text-amber-800 text-sm font-medium flex items-center gap-2">
                      <span>⚠️</span>
                      Category will be updated to:{" "}
                      <strong>{recommendation}</strong>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
