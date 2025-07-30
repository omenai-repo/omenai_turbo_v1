"use client";
import { Loader } from "@mantine/core";
import ProfileSection from "./ProfileSection";
import DangerZone from "./DangerZone";
import SecuritySection from "./SecuritySection";
import { SessionData, SessionDataType, TeamMember } from "@omenai/shared-types";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";

export default function SettingsContainer() {
  const { user } = useAuth({ requiredRole: "admin" });

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader color="gray" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-dark mb-2">Settings</h1>
        <p className="text-dark">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="space-y-6">
        {/* Profile Section */}
        <ProfileSection />

        {/* Security Section */}
        <SecuritySection />

        {/* Danger Zone - Only for Admins */}
        {/* {user.access_role === "Owner" && <DangerZone />} */}
      </div>
    </div>
  );
}
