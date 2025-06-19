"use client";
import { navMockData } from "../navigations/NavigationMockData";
import NavigationItem from "../components/NavigationItem";
import { IndividualLogo } from "@omenai/shared-ui-components/components/logo/Logo";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { toast } from "sonner";

export default function PageLayout() {
  const { signOut } = useAuth({ requiredRole: "gallery" });
  async function handleSignOut() {
    toast.info("Signing out...", {
      description: "You will be redirected to the login page",
    });
    await signOut();
    // router.replace(`${auth_uri}/login`);
  }
  return (
    <div
      className={` h-screen hidden fixed left-0 top-0 sm:block xl:w-72 md:w-56`}
      id="navigation-items"
    >
      <div className="flex flex-col px-5 pt-5">
        <div className={` py-5 w-full`}>
          <IndividualLogo />
        </div>

        {/* Nav items */}
        <div className="flex flex-col mt-4 w-full gap-y-4">
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
                    onClick={async () =>
                      item.title === "Sign out" && (await handleSignOut())
                    }
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
