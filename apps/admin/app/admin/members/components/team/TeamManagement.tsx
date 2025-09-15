"use client";
import { useState } from "react";
import { Button } from "@mantine/core";
import { TeamMember } from "@omenai/shared-types";
import { UserRound } from "lucide-react";
import TeamMembersList from "./TeamMemberList";
import InviteTeamMemberModal from "./InviteTeamMemberModal";
import { useQuery } from "@tanstack/react-query";
import { fetchAllAdmins } from "@omenai/shared-services/admin/fetch_all_admins";
import Load, {
  HomeLoad,
} from "@omenai/shared-ui-components/components/loader/Load";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { canAccessRoute } from "../../../../utils/canAccessRoute";
import ForbiddenPage from "../../../components/ForbiddenPage";
export default function TeamManagement() {
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const { user } = useAuth({ requiredRole: "admin" });

  // Check permissions
  if (!canAccessRoute(user.access_role, "team")) {
    return <ForbiddenPage userRole={user.access_role} />;
  }

  const { data: teamMembers, isLoading: loading } = useQuery({
    queryKey: ["fetch_all_teamMembers"],
    queryFn: async () => {
      const response = await fetchAllAdmins();

      if (!response.isOk)
        throw new Error("Something went wrong, Please contact support");

      return response.data;
    },
  });

  if (loading) return <Load />;

  const handleRoleUpdate = () => {};
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-full p-4">
        {/* Header Section with Enhanced Styling */}
        <div className="mb-4">
          {/* Decorative background element */}
          <div className="absolute inset-x-0 top-0 h-96 bg-gradient-to-b from-gray-900/5 to-transparent -z-10" />

          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-fluid-md 2xl:text-fluid-lg font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Team Members
              </h1>
              <p className="text-gray-600 mt-2 text-fluid-base 2xl:text-fluid-sm">
                Manage your team members and their permissions
              </p>
            </div>

            {(user.access_role === "Admin" || user.access_role === "Owner") && (
              <Button
                onClick={() => setInviteModalOpen(true)}
                leftSection={<UserRound size={20} absoluteStrokeWidth />}
                size="sm"
                radius={"md"}
                styles={{
                  root: {
                    backgroundColor: "#0f172a",
                    border: "none",
                    fontWeight: 600,
                    padding: "12px 24px",
                    boxShadow: "0 4px 14px rgba(0, 0, 0, 0.1)",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      backgroundColor: "#2a2a2a",
                      transform: "translateY(-1px)",
                      boxShadow: "0 6px 20px rgba(0, 0, 0, 0.15)",
                    },
                    "&:active": {
                      transform: "translateY(0)",
                    },
                  },
                }}
              >
                Invite Member
              </Button>
            )}
          </div>

          {/* Decorative divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent mt-8" />
        </div>

        {/* Main Content Area with Card-like Styling */}
        <div className="bg-white rounded shadow-xl border border-gray-200/50 p-8 backdrop-blur-sm">
          <TeamMembersList members={teamMembers} />
        </div>

        {/* Invite Modal */}
        <InviteTeamMemberModal
          opened={inviteModalOpen}
          onClose={() => setInviteModalOpen(false)}
        />
      </div>
    </div>
  );
}
