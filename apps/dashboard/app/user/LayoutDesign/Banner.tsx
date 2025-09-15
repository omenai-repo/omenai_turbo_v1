"use client";

import { CiUser } from "react-icons/ci";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { toast } from "sonner";
import { auth_uri } from "@omenai/url-config/src/config";

export default function Banner() {
  const { user, signOut } = useAuth({
    requiredRole: "user",
    redirectUrl: `${auth_uri()}/login`,
  });
  async function handleSignOut() {
    toast.info("Signing out...", {
      description: "You will be redirected to the login page",
    });
    await signOut();
    // router.replace(`${auth_uri}/login`);
  }

  return (
    <>
      <div className="flex justify-between items-center py-4">
        <div className="flex gap-x-1 items-center">
          <div className="p-2 xs:p-4 md:p-6 rounded bg-dark/5">
            <CiUser className="" />
          </div>

          <div>
            <h1 className="text-fluid-base font-semibold">{user.name}</h1>
            <p className="text-fluid-xs font-normal">{user.email}</p>
          </div>
        </div>
        <div className="" onClick={async () => await handleSignOut()}>
          <button className="p-3 rounded sm:px-4 sm:py-2 md:px-5 md:py-3 bg-dark text-white font-normal border text-fluid-xs border-dark hover:border-dark/30">
            Logout
          </button>
        </div>
      </div>
      {/* <hr /> */}
    </>
  );
}
