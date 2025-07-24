"use client";

import { useState } from "react";
import { Button } from "@mantine/core";
import { MemberRole, TeamMember } from "@omenai/shared-types";
import { UserRound } from "lucide-react";
import TeamMembersList from "./TeamMemberList";
import InviteTeamMemberModal from "./InviteTeamMemberModal";

export const mockTeamMembers: TeamMember[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    email: "sarah.johnson@company.com",
    role: "Admin",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    joinedAt: new Date("2024-01-15"),
  },
  {
    id: "2",
    name: "Michael Chen",
    email: "michael.chen@company.com",
    role: "Editor",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
    joinedAt: new Date("2024-03-20"),
  },
  {
    id: "3",
    name: "Emma Williams",
    email: "emma.williams@company.com",
    role: "Viewer",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma",
    joinedAt: new Date("2024-06-10"),
  },
];
export default function TeamManagement() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(mockTeamMembers);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);

  const handleRoleUpdate = (memberId: string, newRole: TeamMember["role"]) => {
    setTeamMembers((prev) =>
      prev.map((member) =>
        member.id === memberId ? { ...member, role: newRole } : member
      )
    );
  };

  const handleDeleteMember = (memberId: string) => {
    setTeamMembers((prev) => prev.filter((member) => member.id !== memberId));
  };

  const handleInviteMember = (email: string, role: TeamMember["role"]) => {
    const newMember: TeamMember = {
      id: Date.now().toString(),
      name: email.split("@")[0],
      email,
      role,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
      joinedAt: new Date(),
    };
    setTeamMembers((prev) => [...prev, newMember]);
    setInviteModalOpen(false);
  };

  return (
    <div className="max-w-full p-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-semibold text-dark">Team Members</h1>
          <Button
            onClick={() => setInviteModalOpen(true)}
            leftSection={<UserRound size={20} absoluteStrokeWidth />}
            size="md"
            radius={"lg"}
            styles={{
              root: {
                backgroundColor: "#2a2a2a",
                border: "1px solid #3a3a3a",
                "&:hover": {
                  backgroundColor: "#3a3a3a",
                },
              },
            }}
          >
            Invite Member
          </Button>
        </div>
        <p className="text-dark">
          Manage your team members and their permissions
        </p>
      </div>

      {/* Team Members List */}
      <TeamMembersList
        members={teamMembers}
        onRoleUpdate={handleRoleUpdate}
        onDeleteMember={handleDeleteMember}
      />

      {/* Invite Modal */}
      <InviteTeamMemberModal
        opened={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        onInvite={handleInviteMember}
      />
    </div>
  );
}
