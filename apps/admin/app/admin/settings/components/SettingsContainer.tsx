"use client";

import { Loader } from "@mantine/core";
import ProfileSection from "./ProfileSection";
import SecuritySection from "./SecuritySection";
import DangerZone from "./DangerZone";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";

export default function SettingsContainer() {
  const { user } = useAuth({ requiredRole: "admin" });

  if (!user) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader size="sm" color="gray" />
      </div>
    );
  }

  return (
    <section className="max-w-4xl mx-auto space-y-8">
      {/* Page header */}
      <header className="space-y-1">
        <h1 className="text-fluid-lg 2xl:text-fluid-xl font-semibold text-slate-900">
          Account settings
        </h1>
        <p className="text-fluid-xxs text-slate-600 max-w-2xl">
          Manage your profile information, security preferences, and account
          controls.
        </p>
      </header>

      {/* Main content */}
      <div className="space-y-6">
        {/* Profile */}
        <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <ProfileSection />
        </section>

        {/* Security */}
        <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <SecuritySection />
        </section>

        {/* Danger zone */}
        {user.access_role === "Owner" && (
          <section className="rounded-xl border border-red-200 bg-red-50/40">
            <DangerZone />
          </section>
        )}
      </div>
    </section>
  );
}
