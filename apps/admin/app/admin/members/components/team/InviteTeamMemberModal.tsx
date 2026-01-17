"use client";

import { useState } from "react";
import {
  Modal,
  TextInput,
  Select,
  Button,
  Stack,
  Text,
  Alert,
} from "@mantine/core";
import { Shield, UserRoundPen, Eye, Send, Info } from "lucide-react";
import { TeamMember } from "@omenai/shared-types";
import { inviteNewMember } from "@omenai/shared-services/admin/invite_new_member";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { toast_notif } from "@omenai/shared-utils/src/toast_notification";
import { useQueryClient } from "@tanstack/react-query";
import { useRollbar } from "@rollbar/react";

interface InviteTeamMemberModalProps {
  opened: boolean;
  onClose: () => void;
}

const ROLE_OPTIONS = [
  { value: "Admin", label: "Admin", icon: <Shield size={16} /> },
  { value: "Editor", label: "Editor", icon: <UserRoundPen size={16} /> },
  { value: "Viewer", label: "Viewer", icon: <Eye size={16} /> },
];

const ALLOWED_DOMAIN = "omenai.net";

function isValidOrgEmail(email: string) {
  const [_, domain] = email.split("@");
  return domain?.toLowerCase() === ALLOWED_DOMAIN;
}

export default function InviteTeamMemberModal({
  opened,
  onClose,
}: InviteTeamMemberModalProps) {
  const { csrf } = useAuth({ requiredRole: "admin" });
  const queryClient = useQueryClient();
  const rollbar = useRollbar();

  const [email, setEmail] = useState("");
  const [role, setRole] = useState<TeamMember["access_role"]>("Viewer");
  const [loading, setLoading] = useState(false);

  const resetAndClose = () => {
    setEmail("");
    setRole("Viewer");
    onClose();
  };

  const handleInvite = async () => {
    if (!email) return;

    if (!isValidOrgEmail(email)) {
      toast_notif(
        `Only ${ALLOWED_DOMAIN} email addresses can be invited.`,
        "error"
      );
      return;
    }

    setLoading(true);
    try {
      const response = await inviteNewMember(email, role, csrf || "");

      if (!response.isOk) {
        toast_notif(response.message, "error");
        return;
      }

      toast_notif(response.message, "success");
      await queryClient.invalidateQueries({
        queryKey: ["fetch_all_teamMembers"],
      });

      resetAndClose();
    } catch (err) {
      rollbar.error(err instanceof Error ? err : new Error(String(err)));
      toast_notif("Something went wrong. Please contact support.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={resetAndClose}
      centered
      size="md"
      radius="md"
      title="Invite team member"
      overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
    >
      <Stack gap="sm">
        <Text size="sm" c="dimmed">
          Invite a colleague to join your team and assign their access level.
        </Text>

        <TextInput
          label="Work email"
          placeholder={`name@${ALLOWED_DOMAIN}`}
          value={email}
          onChange={(e) => setEmail(e.currentTarget.value)}
          radius="md"
          required
        />

        <Select
          label="Role"
          value={role}
          onChange={(val) => setRole(val as TeamMember["access_role"])}
          data={ROLE_OPTIONS}
          leftSection={ROLE_OPTIONS.find((r) => r.value === role)?.icon}
          radius="md"
        />

        <Alert icon={<Info size={16} />} color="blue" variant="light">
          The invited member will receive an email with instructions to join
          your team.
        </Alert>

        <div className="flex gap-3 pt-2">
          <Button
            variant="subtle"
            fullWidth
            disabled={loading}
            onClick={resetAndClose}
          >
            Cancel
          </Button>

          <Button
            fullWidth
            loading={loading}
            disabled={!email}
            leftSection={<Send size={16} />}
            onClick={handleInvite}
            color="dark"
          >
            Send invite
          </Button>
        </div>
      </Stack>
    </Modal>
  );
}
