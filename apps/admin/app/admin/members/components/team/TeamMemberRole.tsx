"use client";

import { useState } from "react";
import { Avatar, ActionIcon } from "@mantine/core";

import DeleteConfirmationModal from "./DeleteConfirmationModal";
import { TeamMember } from "@omenai/shared-types";
import RoleDropdown from "./RoleDropdown";
import { Trash } from "lucide-react";

interface TeamMemberRowProps {
  member: TeamMember;
  onRoleUpdate: (memberId: string, role: TeamMember["role"]) => void;
  onDeleteMember: (memberId: string) => void;
}

export default function TeamMemberRow({
  member,
  onRoleUpdate,
  onDeleteMember,
}: TeamMemberRowProps) {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  return (
    <>
      <div className="grid grid-cols-12 gap-4 p-6 items-center">
        <div className="col-span-5 flex items-center gap-3">
          <Avatar
            src={member.avatar}
            alt={member.name}
            size={40}
            radius="xl"
            styles={{
              root: {
                border: "2px solid #2a2a2a",
              },
            }}
          />
          <div>
            <p className="font-medium text-white">{member.name}</p>
            <p className="text-sm text-gray-400">{member.email}</p>
          </div>
        </div>
        <div className="col-span-3">
          <RoleDropdown
            value={member.role}
            onChange={(role) => onRoleUpdate(member.id, role)}
          />
        </div>
        <div className="col-span-2">
          <p className="text-gray-400">{formatDate(member.joinedAt)}</p>
        </div>
        <div className="col-span-2 flex justify-end">
          <ActionIcon
            onClick={() => setDeleteModalOpen(true)}
            size="lg"
            variant="subtle"
            color="red"
            styles={{
              root: {
                "&:hover": {
                  backgroundColor: "#2a2a2a",
                },
              },
            }}
          >
            <Trash size={20} absoluteStrokeWidth />
          </ActionIcon>
        </div>
      </div>

      <DeleteConfirmationModal
        opened={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={() => {
          onDeleteMember(member.id);
          setDeleteModalOpen(false);
        }}
        memberName={member.name}
      />
    </>
  );
}
