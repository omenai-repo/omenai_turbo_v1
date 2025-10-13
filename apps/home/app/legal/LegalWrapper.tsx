"use client";
import { useState } from "react";
import PrivacyPolicy from "./components/PrivacyWrapper";
import { notFound, useSearchParams } from "next/navigation";
import ArtistsTerms from "./components/ArtistTerms";
import GalleriesTerms from "./components/GalleryTerms";
import CollectorsTerms from "./components/CollectorTerms";

export default function LegalDocuments() {
  const [activeTab, setActiveTab] = useState("terms");
  const searchParams = useSearchParams();
  const entity: "artist" | "gallery" | "collector" = searchParams.get("ent") as
    | "artist"
    | "gallery"
    | "collector";

  if (!entity || !["artist", "gallery", "collector"].includes(entity))
    return notFound();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-gray-200">
        <div className="max-w-4xl mx-auto  py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Omenai Legal Documents
          </h1>
          <p className="text-gray-600">
            Review our privacy policy and terms of use
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-gray-200">
        <div className="max-w-4xl mx-auto ">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab("privacy")}
              className={`p-2 rounded font-medium text-sm transition-colors ${
                activeTab === "privacy"
                  ? "border-dark bg-dark text-white px-4"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Privacy Policy
            </button>
            <button
              onClick={() => setActiveTab("terms")}
              className={`p-2 rounded font-medium text-sm transition-colors ${
                activeTab === "terms"
                  ? "border-dark text-white bg-dark"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Terms of Use
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto  py-8">
        {/* Privacy Policy Content */}
        {activeTab === "privacy" && <PrivacyPolicy />}

        {/* Terms of Use Content */}
        {activeTab === "terms" &&
          (entity === "artist" ? (
            <ArtistsTerms />
          ) : entity === "gallery" ? (
            <GalleriesTerms />
          ) : (
            <CollectorsTerms />
          ))}
      </div>
    </div>
  );
}
