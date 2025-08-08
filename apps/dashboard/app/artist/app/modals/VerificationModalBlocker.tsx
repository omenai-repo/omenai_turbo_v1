"use client";
import { Modal } from "@mantine/core";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { auth_uri } from "@omenai/url-config/src/config";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function VerificationBlockerModal({ open }: { open: boolean }) {
  const router = useRouter();
  const { signOut } = useAuth({ requiredRole: "artist" });

  async function handleSignOut() {
    toast.info("Signing out...", {
      description: "You will be redirected to the login page",
    });

    await signOut();
  }
  return (
    <>
      <Modal
        opened={open}
        onClose={() => {}}
        radius={"md"}
        centered
        p={16}
        size={"lg"}
      >
        <div className="bg-white text-black dark:bg-[#0f172a] dark:text-white w-full text-center p-8">
          <h2 className="text-fluid-sm md:text-fluid-md font-semibold mb-4">
            Verification in Progress
          </h2>
          <p className="text-fluid-xs text-gray-700 dark:text-gray-300 mb-6">
            Your profile is currently under review. You&apos;ll be notified once
            your verification status is updated. In the meantime, access to
            dashboard features is currently restricted. Please check back later.
          </p>
          <div className="w-full flex justify-center mt-8">
            <button
              onClick={async () => await handleSignOut()}
              className="h-[35px] p-5 rounded-xl w-fit flex items-center justify-center gap-3 disabled:cursor-not-allowed disabled:bg-dark/10 disabled:text-[#A1A1A1] bg-dark text-white text-fluid-xs font-normal"
            >
              Logout
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
