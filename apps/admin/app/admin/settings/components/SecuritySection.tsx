"use client";

import { useState } from "react";
import { Button } from "@mantine/core";
import { Lock, Shield } from "lucide-react";
import ChangePasswordModal from "./ChangePasswordModal";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";

export default function SecuritySection() {
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const { user } = useAuth({ requiredRole: "admin" });

  return (
    <>
      <div className="bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] p-6">
        <div className="flex items-center gap-3 mb-6">
          <Shield size={24} className="text-green-500" />
          <h2 className="text-fluid-sm font-semibold text-white">Security</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-[#0a0a0a] rounded-lg border border-[#2a2a2a]">
            <div>
              <p className="text-white font-medium">Password</p>
              {/* <p className="text-gray-400 text-sm">Last changed 3 months ago</p> */}
            </div>
            <Button
              onClick={() => setPasswordModalOpen(true)}
              leftSection={<Lock size={16} />}
              variant="subtle"
              styles={{
                root: {
                  backgroundColor: "#2a2a2a",
                  color: "white",
                  "&:hover": {
                    backgroundColor: "#3a3a3a",
                  },
                },
              }}
            >
              Change Password
            </Button>
          </div>

          <div className="p-4 bg-[#0a0a0a] rounded-lg border border-[#2a2a2a]">
            <p className="text-white font-medium mb-1">
              Two-Factor Authentication
            </p>
            <p className="text-gray-400 text-sm">
              Add an extra layer of security to your account
            </p>
            <Button
              mt="sm"
              variant="subtle"
              disabled
              styles={{
                root: {
                  color: "#666",
                  "&:disabled": {
                    backgroundColor: "transparent",
                  },
                },
              }}
            >
              Coming Soon
            </Button>
          </div>
        </div>
      </div>

      <ChangePasswordModal
        opened={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
      />
    </>
  );
}
