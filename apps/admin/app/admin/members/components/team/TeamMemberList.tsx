import { TeamMember } from "@omenai/shared-types";
import TeamMemberRow from "./TeamMemberRole";

interface TeamMembersListProps {
  members: TeamMember[];
}

export default function TeamMembersList({ members }: TeamMembersListProps) {
  return (
    <div className="overflow-hidden">
      {/* Table header */}
      <div className="px-6 py-3 border-b border-slate-200 bg-gray-50">
        <div className="grid grid-cols-12 gap-4 text-fluid-xxs font-medium text-slate-600">
          <div className="col-span-5">Member</div>
          <div className="col-span-3">Role</div>
          <div className="col-span-2">Joined</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>
      </div>

      {/* Rows */}
      <div className="divide-y divide-gray-100">
        {members.map((member) => (
          <TeamMemberRow key={member.admin_id} member={member} />
        ))}
      </div>
    </div>
  );
}
