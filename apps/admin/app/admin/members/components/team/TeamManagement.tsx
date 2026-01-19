"use client";

import { useState } from "react";
import { Button } from "@mantine/core";
import { UserPlus } from "lucide-react";
import TeamMembersList from "./TeamMemberList";
import InviteTeamMemberModal from "./InviteTeamMemberModal";
import { useQuery } from "@tanstack/react-query";
import { fetchAllAdmins } from "@omenai/shared-services/admin/fetch_all_admins";
import Load from "@omenai/shared-ui-components/components/loader/Load";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { canAccessRoute } from "../../../../utils/canAccessRoute";
import ForbiddenPage from "../../../components/ForbiddenPage";

export default function TeamManagement() {
  const { user } = useAuth({ requiredRole: "admin" });
  const [inviteModalOpen, setInviteModalOpen] = useState(false);

  // Permissions
  if (!canAccessRoute(user.access_role, "team")) {
    return <ForbiddenPage userRole={user.access_role} />;
  }

  const { data: teamMembers, isLoading } = useQuery({
    queryKey: ["fetch_all_team_members"],
    queryFn: async () => {
      const response = await fetchAllAdmins();
      if (!response.isOk) {
        throw new Error("Failed to fetch team members");
      }
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Load />
      </div>
    );
  }

  return (
    <section className="max-w-full mx-auto space-y-6">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-fluid-md font-semibold text-slate-900">
            Team members
          </h1>
          <p className="text-fluid-xxs text-slate-600 mt-1">
            Manage access and roles for people in your organization.
          </p>
        </div>

        {(user.access_role === "Admin" || user.access_role === "Owner") && (
          <Button
            onClick={() => setInviteModalOpen(true)}
            leftSection={<UserPlus size={16} />}
          >
            Invite member
          </Button>
        )}
      </header>

      {/* Content */}
      <div className="rounded p-1 border border-slate-200 bg-white shadow-sm">
        <TeamMembersList members={teamMembers} />
      </div>

      {/* Invite modal */}
      <InviteTeamMemberModal
        opened={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
      />
    </section>
  );
}
