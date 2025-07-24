"use client";
import { Loader } from "@mantine/core";
import ProfileSection from "./ProfileSection";
import DangerZone from "./DangerZone";
import SecuritySection from "./SecuritySection";
import { TeamMember } from "@omenai/shared-types";

export default function SettingsContainer() {
  const user: TeamMember = {
    id: "1",
    name: "Sarah Johnson",
    email: "sarah.johnson@company.com",
    role: "Admin", // Change this to test different roles
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    joinedAt: new Date("2024-01-15"),
  };

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
        <ProfileSection user={user} />

        {/* Security Section */}
        <SecuritySection user={user} />

        {/* Danger Zone - Only for Admins */}
        {user.role === "Admin" && <DangerZone user={user} />}
      </div>
    </div>
  );
}
