import { TeamMember } from "@omenai/shared-types";
import TeamMemberRow from "./TeamMemberRole";

interface TeamMembersListProps {
  members: TeamMember[];
}

export default function TeamMembersList({ members }: TeamMembersListProps) {
  return (
    <div className="bg-[#0f172a] rounded-lg border border-[#2a2a2a]">
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
          <TeamMemberRow key={member.admin_id} member={member} />
        ))}
      </div>
    </div>
  );
}
