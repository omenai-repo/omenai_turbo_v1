"use client";

import { useState } from "react";
import { Modal, TextInput, Select, Button } from "@mantine/core";
import { TeamMember } from "@omenai/shared-types";
import { Shield, UserRoundPen, Eye, Send } from "lucide-react";

interface InviteTeamMemberModalProps {
  opened: boolean;
  onClose: () => void;
  onInvite: (email: string, role: TeamMember["role"]) => void;
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

export default function InviteTeamMemberModal({
  opened,
  onClose,
  onInvite,
}: InviteTeamMemberModalProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<TeamMember["role"]>("Viewer");

  const handleSubmit = () => {
    if (email) {
      onInvite(email, role);
      setEmail("");
      setRole("Viewer");
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Invite Team Member"
      centered
      radius={"lg"}
      styles={{
        root: {
          ".mantine-Modal-content": {
            backgroundColor: "#1a1a1a",
            border: "1px solid #2a2a2a",
          },
          ".mantine-Modal-header": {
            backgroundColor: "#1a1a1a",
            borderBottom: "1px solid #2a2a2a",
          },
          ".mantine-Modal-title": {
            color: "white",
            fontSize: "1.55rem",
            fontWeight: 600,
          },
          ".mantine-Modal-close": {
            color: "#1a1a1a",
            "&:hover": {
              backgroundColor: "#2a2a2a",
            },
          },
        },
      }}
    >
      <div className="space-y-4 p-4">
        <TextInput
          label="Email Address"
          placeholder="colleague@company.com"
          value={email}
          radius={"sm"}
          size="md"
          variant="default"
          onChange={(e) => setEmail(e.currentTarget.value)}
          //   leftSection={<Send size={20} absoluteStrokeWidth />}
          styles={{
            label: {
              color: "#1a1a1a",
              marginBottom: "0.5rem",
              fontSize: "0.875rem",
            },
            input: {
              border: "1px solid #3a3a3a",
              color: "#1a1a1a",
              "&:focus": {
                borderColor: "#4a4a4a",
              },
              "&::placeholder": {
                color: "#1a1a1a/60",
              },
            },
          }}
        />

        <Select
          label="Role"
          value={role}
          onChange={(val) => setRole(val as TeamMember["role"])}
          data={roleOptions}
          variant="default"
          leftSection={roleOptions.find((r) => r.value === role)?.icon ?? null}
          styles={{
            label: {
              color: "#1a1a1a",
              marginBottom: "0.5rem",
            },
            input: {
              border: "1px solid #3a3a3a",
              "&:focus": {
                borderColor: "#4a4a4a",
              },
            },
            dropdown: {
              backgroundColor: "white",
              border: "1px solid #3a3a3a",
            },
            option: {
              "&[data-hovered]": {
                backgroundColor: "#3a3a3a",
              },
            },
          }}
        />

        <div className="flex gap-3 pt-4">
          <Button
            onClick={onClose}
            variant="default"
            fullWidth
            styles={{
              root: {
                color: "#1a1a1a",
                "&:hover": {
                  backgroundColor: "#2a2a2a",
                },
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            fullWidth
            disabled={!email}
            styles={{
              root: {
                backgroundColor: "#1a1a1a",
                "&:hover": {
                  backgroundColor: "#4a4a4a",
                },
                "&:disabled": {
                  backgroundColor: "#2a2a2a",
                  color: "#666",
                },
              },
            }}
          >
            Send Invite
          </Button>
        </div>
      </div>
    </Modal>
  );
}
