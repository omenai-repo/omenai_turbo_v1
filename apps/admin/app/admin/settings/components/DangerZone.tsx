"use client";

import { useState } from "react";
import { Button } from "@mantine/core";
import { Trash, TriangleAlert } from "lucide-react";
import DeleteAccountModal from "./DeleteAccountModal";
import { TeamMember } from "@omenai/shared-types";

interface DangerZoneProps {
  user: TeamMember;
}

export default function DangerZone({ user }: DangerZoneProps) {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  return (
    <>
      <div className="bg-[#1a1a1a] rounded-lg border border-red-900/50 p-6">
        <div className="flex items-center gap-3 mb-6">
          <TriangleAlert size={24} className="text-red-500" />
          <h2 className="text-xl font-semibold text-white">Danger Zone</h2>
        </div>

        <div className="p-4 bg-red-950/20 rounded-lg border border-red-900/30">
          <h3 className="text-white font-medium mb-2">Delete Account</h3>
          <p className="text-gray-400 text-sm mb-4">
            Once you delete your account, there is no going back. All your data
            will be permanently removed.
          </p>
          <Button
            onClick={() => setDeleteModalOpen(true)}
            leftSection={<Trash size={16} />}
            color="red"
            variant="subtle"
            styles={{
              root: {
                backgroundColor: "transparent",
                color: "#ef4444",
                border: "1px solid #ef4444",
                "&:hover": {
                  backgroundColor: "#dc2626",
                  color: "white",
                },
              },
            }}
          >
            Delete Account
          </Button>
        </div>
      </div>

      <DeleteAccountModal
        opened={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        userEmail={user.email}
      />
    </>
  );
}
