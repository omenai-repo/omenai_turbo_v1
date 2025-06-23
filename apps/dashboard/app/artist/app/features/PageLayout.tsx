"use client";
import { navMockData } from "../navigations/NavigationMockData";
import NavigationItem from "../components/NavigationItem";
import { ArtistLogo } from "@omenai/shared-ui-components/components/logo/Logo";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { auth_uri } from "@omenai/url-config/src/config";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";

export default function PageLayout() {
  const router = useRouter();
  const { signOut } = useAuth({
    requiredRole: "artist",
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
    <div
      className={` h-screen hidden fixed left-0 top-0 sm:block xl:w-72 md:w-56`}
      id="navigation-items"
    >
      <div className="flex relative flex-col px-5 pt-5 h-full">
        <div className={` py-5 w-full`}>
          <ArtistLogo />
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
