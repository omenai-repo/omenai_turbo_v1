"use client";

import { useState } from "react";
import { Avatar, ActionIcon } from "@mantine/core";

import DeleteConfirmationModal from "./DeleteConfirmationModal";
import { TeamMember } from "@omenai/shared-types";
import RoleDropdown from "./RoleDropdown";
import { Trash } from "lucide-react";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";

interface TeamMemberRowProps {
  member: TeamMember;
}

export default function TeamMemberRow({ member }: TeamMemberRowProps) {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const { user } = useAuth({ requiredRole: "admin" });
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  const canDelete =
    member.access_role !== "Owner" && // Owner can never be deleted
    (user.access_role === "Owner" || // Owner can delete anyone (except other Owners)
      (user.access_role === "Admin" &&
        ["Editor", "Viewer"].includes(member.access_role)));

  console.log(member);
  return (
    <>
      <div className="grid grid-cols-12 gap-4 p-6 items-center">
        <div className="col-span-5 flex items-center gap-3">
          <Avatar color="initials" name={member.name} />
          <div>
            <p className="font-medium text-fluid-xxs text-white">
              {member.name || "Anonymous"}
            </p>
            <p className="text-fluid-xxs text-gray-400">{member.email}</p>
          </div>
        </div>
        <div className="col-span-3">
          <RoleDropdown
            value={member.access_role}
            isMemberVerified={member.verified}
            member_id={member.admin_id}
          />
        </div>
        <div className="col-span-2">
          <p className="text-gray-400 text-fluid-xxs">
            {member.joinedAt ? (
              formatDate(new Date(member.joinedAt))
            ) : (
              <span className=" text-amber-500">Pending</span>
            )}
          </p>
        </div>
        {canDelete && (
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
        )}
      </div>

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
