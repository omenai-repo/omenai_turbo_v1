import { Select } from "@mantine/core";
import { TeamMember } from "@omenai/shared-types";
import { Eye, MousePointer2, Shield, UserRoundPen } from "lucide-react";

interface RoleDropdownProps {
  value: TeamMember["role"];
  onChange: (role: TeamMember["role"]) => void;
}

const roleOptions = [
  {
    value: "Admin",
    label: "Admin",
    icon: <Shield size={20} absoluteStrokeWidth />,
  },
  {
    value: "Editor",
    label: "Editor",
    icon: <UserRoundPen size={20} absoluteStrokeWidth />,
  },
  {
    value: "Viewer",
    label: "Viewer",
    icon: <Eye size={20} absoluteStrokeWidth />,
  },
];

export default function RoleDropdown({ value, onChange }: RoleDropdownProps) {
  // Extract the icon component for the selected role
  const SelectedIcon = roleOptions.find((r) => r.value === value)?.icon;

  return (
    <Select
      value={value}
      onChange={(val) => onChange(val as TeamMember["role"])}
      data={roleOptions}
      styles={{
        input: {
          backgroundColor: "#2a2a2a",
          border: "1px solid #3a3a3a",
          color: "white",
          "&:focus": {
            borderColor: "#4a4a4a",
          },
        },
        dropdown: {
          backgroundColor: "white",
          border: "1px solid #3a3a3a",
        },
        option: {
          color: "#1a1a1a",
          "&[data-hovered]": {
            backgroundColor: "white",
          },
        },
      }}
    />
  );
}
