"use client";
import { navMockData } from "../navigations/NavigationMockData";
import NavigationItem from "../components/NavigationItem";
import { toast } from "sonner";
import { signOut } from "@omenai/shared-services/auth/session/deleteSession";
import { IndividualLogo } from "@omenai/shared-ui-components/components/logo/Logo";
import { useRouter } from "next/navigation";
import { login_url } from "@omenai/url-config/src/config";

export default function PageLayout() {
  const router = useRouter();
  async function handleSignout() {
    toast.info("Signing you out...");

    const auth_url = login_url();
    const res = await signOut();

    if (res.isOk) {
      toast.info("Operation successful", {
        description: "Successfully signed out...redirecting",
      });
      router.replace(auth_url);
    } else {
      toast.error("Operation successful", {
        description:
          "Something went wrong, please try again or contact support",
      });
    }
  }

  return (
    <div
      className={` h-screen hidden fixed left-0 top-0 sm:block xl:w-72 md:w-56`}
      id="navigation-items"
    >
      <div className="flex flex-col p-5">
        <div className={` py-5 w-full`}>
          <IndividualLogo />
        </div>

        {/* Nav items */}
        <div className="flex flex-col mt-6 w-full gap-y-8">
          {/* General navigation */}
          <div className="w-full">
            <ul className="flex flex-col gap-y-1 w-full">
              {navMockData.general.map((item, index) => {
                return (
                  <NavigationItem
                    title={item.title}
                    icon={item.icon}
                    key={item.title}
                    url={item.url}
                    mobile={false}
                  />
                );
              })}
            </ul>
          </div>
          {/* Account pages */}
          <div>
            <ul className="flex flex-col gap-y-1">
              {navMockData.account.map((item, index) => {
                return (
                  <NavigationItem
                    title={item.title}
                    icon={item.icon}
                    key={item.title}
                    url={item.url}
                    mobile={false}
                    onClick={() => item.title === "Sign out" && handleSignout()}
                  />
                );
              })}
            </ul>
          </div>
        </div>
        {/* Help box */}
      </div>

      {/* Nav logo */}
    </div>
  );
}
