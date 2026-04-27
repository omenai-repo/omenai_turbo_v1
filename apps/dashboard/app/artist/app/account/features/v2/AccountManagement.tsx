"use client";
import React, { useState } from "react";
import { User, Settings, Award } from "lucide-react";
import CredentialsVerificationModal from "./modals/CredentialsVerificationModal";
import CredentialsUpdateModal from "./modals/CredentialsUpdateModal";
import AccountInformation from "./AccountInformation";
import Credentials from "./Credentials";
import AccountSettings from "./Settings";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { fetchArtistProfile } from "@omenai/shared-services/artist/fetchArtistProfile";
import { fetchArtistCredentials } from "@omenai/shared-services/artist/fetchArtistCredentials";
import { ArtistProfileSkeleton } from "@omenai/shared-ui-components/components/skeletons/ArtistProfileSkeleton";
import {
  ArtistCategorizationAnswerTypes,
  ArtistCategory,
} from "@omenai/shared-types";

// Main Account Management Component
const AccountManagement = () => {
  const [activeTab, setActiveTab] = useState("account");

  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  const { user } = useAuth({ requiredRole: "artist" });

  const { data, error, isLoading } = useQuery({
    queryKey: ["fetch_artist_info", user.artist_id],
    queryFn: async () => {
      try {
        const [profile, credentials] = await Promise.all([
          fetchArtistProfile(user.artist_id),
          fetchArtistCredentials(user.artist_id),
        ]);

        return {
          profile: profile.artist,
          credential_data: {
            credentials: credentials.credentials,
            documentation: credentials.documentation,
          },
        };
      } catch (err) {
        console.error("Failed to fetch artist info:", err);
        throw err; // rethrow so React Query marks query as error
      }
    },
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
    enabled: !!user.artist_id,
  });

  if (isLoading) return <ArtistProfileSkeleton />;

  return (
    <div className="min-h-screen">
      <div className="max-w-full">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-fluid-sm font-bold text-dark mb-2">
            Account Management
          </h1>
          <p className="text-fluid-xxs text-dark/50">
            Manage your artist profile and account settings
          </p>
        </div>

        {/* Tabs Navigation */}
        <div className="flex space-x-1 mb-4 bg-gray-400 p-1 rounded">
          <button
            onClick={() => setActiveTab("account")}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded text-fluid-xxs font-normal 
                     transition-all duration-300 ${
                       activeTab === "account"
                         ? "bg-white text-dark shadow-md"
                         : "text-dark/50 hover:text-dark hover:bg-white/50"
                     }`}
          >
            <User className="w-4 h-4" />
            <span>Account Information</span>
          </button>
          <button
            onClick={() => setActiveTab("credentials")}
            className={`flex-1 flex items-center justify-center space-x-2 px-6 py-3 rounded text-fluid-xxs font-normal 
                     transition-all duration-300 ${
                       activeTab === "credentials"
                         ? "bg-white text-dark shadow-md"
                         : "text-dark/50 hover:text-dark hover:bg-white/50"
                     }`}
          >
            <Award className="w-4 h-4" />
            <span>Credentials</span>
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`flex-1 flex items-center justify-center space-x-2 px-6 py-3 rounded text-fluid-xxs font-normal 
                     transition-all duration-300 ${
                       activeTab === "settings"
                         ? "bg-white text-dark shadow-md"
                         : "text-dark/50 hover:text-dark hover:bg-white/50"
                     }`}
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded shadow-xl p-8">
          {activeTab === "account" && (
            <AccountInformation profile={data?.profile} />
          )}
          {activeTab === "credentials" && (
            <Credentials
              credentials={
                data?.credential_data.credentials.categorization
                  .answers as ArtistCategorizationAnswerTypes
              }
              categorization={
                data?.credential_data.credentials.categorization
                  .artist_categorization as ArtistCategory
              }
              documentation={data?.credential_data.documentation}
            />
          )}
          {activeTab === "settings" && <AccountSettings />}
        </div>
      </div>

      {showVerificationModal && <CredentialsVerificationModal />}
      {showCredentialsModal && <CredentialsUpdateModal />}

      {/* Custom Animations */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default AccountManagement;
