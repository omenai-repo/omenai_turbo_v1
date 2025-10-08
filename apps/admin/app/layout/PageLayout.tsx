"use client";
import {
  artist,
  gallery,
  NavMockData,
  navMockData,
  promotionals,
} from "./navMockData";
import NavigationItem from "./NavigationItem";
import { IndividualLogo } from "@omenai/shared-ui-components/components/logo/Logo";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { toast } from "sonner";
import { admin_url, auth_uri } from "@omenai/url-config/src/config";
import { TeamMember } from "@omenai/shared-types";
import { canAccessRoute } from "../utils/canAccessRoute";

export default function PageLayout() {
  const { signOut, user } = useAuth({
    requiredRole: "admin",
    redirectUrl: `${admin_url()}/auth/login`,
  });
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
        <div className="flex flex-col mt-4 w-full gap-y-2">
          {/* General navigation */}
          <div className="w-full flex flex-col">
            <h1 className="font-medium text-fluid-xxs">Actions</h1>
            <ul className="flex flex-col w-full space-y-1">
              {navMockData.actions.map((item, index) => {
                return (
                  <NavigationItem
                    title={item.title}
                    icon={item.icon}
                    key={item.title}
                    url={item.url}
                    mobile={false}
                    disabled={canAccessRoute(user.access_role, item.key)}
                  />
                );
              })}
            </ul>
          </div>
          <div className="w-full flex flex-col">
            <h1 className="font-medium text-fluid-xxs">Activity</h1>
            <ul className="flex flex-col w-full space-y-1">
              {navMockData.activity.map((item, index) => {
                return (
                  <NavigationItem
                    title={item.title}
                    icon={item.icon}
                    key={item.title}
                    url={item.url}
                    mobile={false}
                    disabled={canAccessRoute(user.access_role, item.key)}
                  />
                );
              })}
            </ul>
          </div>
          <div className="w-full flex flex-col">
            <h1 className="font-medium text-fluid-xxs">Management</h1>
            <ul className="flex flex-col w-full space-y-1">
              {navMockData.management.map((item, index) => {
                return (
                  <NavigationItem
                    title={item.title}
                    icon={item.icon}
                    key={item.title}
                    url={item.url}
                    mobile={false}
                    disabled={canAccessRoute(user.access_role, item.key)}
                  />
                );
              })}
            </ul>
          </div>
          {/* Account pages */}
          <div className="w-full flex flex-col">
            <h1 className="font-medium text-fluid-xxs">Account</h1>
            <ul className="flex flex-col">
              {navMockData.account.map((item, index) => {
                return (
                  <NavigationItem
                    title={item.title}
                    icon={item.icon}
                    key={item.title}
                    url={item.url}
                    mobile={false}
                    disabled={canAccessRoute(user.access_role, item.key)}
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
