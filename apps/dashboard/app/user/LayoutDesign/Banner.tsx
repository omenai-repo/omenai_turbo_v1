"use client";

import { SessionContext } from "@omenai/package-provider/SessionProvider";
import { signOut } from "@omenai/shared-services/auth/session/deleteSession";
import { useRouter } from "next/navigation";
import { useContext } from "react";
import { CiUser } from "react-icons/ci";
import { toast } from "sonner";
import { auth_uri } from "@omenai/url-config/src/config";

export default function Banner() {
  const { session } = useContext(SessionContext);
  const router = useRouter();
  const auth_url = auth_uri();
  async function handleSignout() {
    toast.info("Signing you out...");
    const res = await signOut();

    if (res.isOk) {
      toast.info("Operation successful", {
        description: "Successfully signed out...redirecting",
      });
      router.replace(`${auth_url}/login`);
    } else {
      toast.error("Operation successful", {
        description:
          "Something went wrong, please try again or contact support",
      });
    }
  }
  return (
    <>
      <div className="flex justify-between items-center py-4">
        <div className="flex gap-x-1 items-center">
          <div className="p-2 xs:p-4 md:p-6 rounded-full bg-dark/5">
            <CiUser className="" />
          </div>

          <div>
            <h1 className="text-fluid-base font-semibold">{session?.name}</h1>
            <p className="text-fluid-xs font-normal">{session?.email}</p>
          </div>
        </div>
        <div className="" onClick={() => handleSignout()}>
          <button className="p-3 rounded-full sm:px-4 sm:py-2 md:px-5 md:py-3 bg-dark text-white font-normal border text-fluid-xs border-dark hover:border-dark/30">
            Logout
          </button>
        </div>
      </div>
      {/* <hr /> */}
    </>
  );
}
