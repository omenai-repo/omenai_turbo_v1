"use client";

import { useState } from "react";
import { Avatar, ActionIcon } from "@mantine/core";
import { Trash } from "lucide-react";
import { TeamMember } from "@omenai/shared-types";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import RoleDropdown from "./RoleDropdown";
import DeleteConfirmationModal from "./DeleteConfirmationModal";

interface TeamMemberRowProps {
  member: TeamMember;
}

export default function TeamMemberRow({ member }: TeamMemberRowProps) {
  const { user } = useAuth({ requiredRole: "admin" });
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);

  const canDelete =
    member.access_role !== "Owner" &&
    (user.access_role === "Owner" ||
      (user.access_role === "Admin" &&
        ["Editor", "Viewer"].includes(member.access_role)));

  return (
    <>
      <div
        className="
          grid grid-cols-12 gap-4 px-6 py-4 items-center
          hover:bg-gray-50 transition-colors
        "
      >
        {/* Member */}
        <div className="col-span-5 flex items-center gap-3 min-w-0">
          <Avatar size={36} radius="xl">
            {member.name?.charAt(0)}
          </Avatar>

          <div className="min-w-0">
            <p className="font-medium text-fluid-xxs text-slate-900 truncate">
              {member.name || "Anonymous"}
            </p>
            <p className="text-fluid-xxs text-slate-500 truncate">
              {member.email}
            </p>
          </div>
        </div>

        {/* Role */}
        <div className="col-span-3">
          <RoleDropdown
            value={member.access_role}
            isMemberVerified={member.verified}
            member_id={member.admin_id}
          />
        </div>

        {/* Joined */}
        <div className="col-span-2">
          {member.joinedAt ? (
            <p className="text-fluid-xxs text-slate-600">
              {formatDate(new Date(member.joinedAt))}
            </p>
          ) : (
            <span className="text-fluid-xxs font-medium text-amber-600">
              Pending
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="col-span-2 flex justify-end">
          {canDelete && (
            <ActionIcon
              onClick={() => setDeleteModalOpen(true)}
              variant="subtle"
              color="red"
              aria-label={`Remove ${member.name}`}
            >
              <Trash size={18} />
            </ActionIcon>
          )}
        </div>
      </div>

      {/* Delete modal */}
      <DeleteConfirmationModal
        opened={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        memberName={member.name}
        member_email={member.email}
        member_id={member.admin_id}
      />
    </>
  );
}
