import { TeamMember } from "@omenai/shared-types";
import TeamMemberRow from "./TeamMemberRole";

interface TeamMembersListProps {
  members: TeamMember[];
  onRoleUpdate: (memberId: string, role: TeamMember["role"]) => void;
  onDeleteMember: (memberId: string) => void;
}

export default function TeamMembersList({
  members,
  onRoleUpdate,
  onDeleteMember,
}: TeamMembersListProps) {
  return (
    <div className="bg-[#1a1a1a] rounded-lg border border-[#2a2a2a]">
      <div className="p-6 border-b border-[#2a2a2a]">
        <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-400">
          <div className="col-span-5">Member</div>
          <div className="col-span-3">Role</div>
          <div className="col-span-2">Joined</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>
      </div>
      <div className="divide-y divide-[#2a2a2a]">
        {members.map((member) => (
          <TeamMemberRow
            key={member.id}
            member={member}
            onRoleUpdate={onRoleUpdate}
            onDeleteMember={onDeleteMember}
          />
        ))}
      </div>
    </div>
  );
}
