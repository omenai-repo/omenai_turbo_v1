"use client";
import { BsArrowLeftShort } from "react-icons/bs";
import { toast } from "sonner";
import { navMockData } from "./mocks/NavigationMockData";
import NavigationItem from "./NavigationItem";
import { adminNavigationActions } from "@omenai/shared-state-store/src/admin/AdminNavigationStore";
import { useRouter } from "next/navigation";
import { signOut } from "@omenai/shared-services/auth/session/deleteSession";
export default function PageLayout() {
  const { open, setOpen } = adminNavigationActions();

  const router = useRouter();
  async function handleSignout() {
    toast.info("Signing you out...");
    const res = await signOut();

    if (res.isOk) {
      toast.info("Operation successful", {
        description: "Successfully signed out...redirecting",
      });
      router.replace("/auth/login/secure/admin");
    } else {
      toast.error("Error Notification", {
        description:
          "Something went wrong, please try again or contact support",
        style: {
          background: "red",
          color: "white",
        },
        className: "class",
      });
    }
  }

  toast.error("Error notification", {
    description: "Admin session expired. Please login again",
    style: {
      background: "red",
      color: "white",
    },
    className: "class",
  });

  return (
    <div
      className={` h-screen hidden fixed left-0 top-0 sm:block ${
        open ? "xl:w-72 md:w-56" : "w-24"
      } p-5 pt-8 duration-200 border-r border-r-dark bg-dark`}
    >
      <div
        className="bg-white absolute -right-3 top-9 z-[100] border border-1 border-dark  cursor-pointer rounded-full w-fit"
        id="expand"
      >
        <BsArrowLeftShort
          onClick={() => setOpen()}
          className={`text-fluid-sm  ${!open && "rotate-180"} duration-200 `}
        />
      </div>

      <div className="flex flex-col">
        <div className={`${!open && "w-fit"} duration-200 w-full`}>
          {/* <IndividualLogo /> */}
        </div>

        {/* Nav items */}
        <div className="flex flex-col gap-y-8 mt-12" id="navigation-items">
          {/* General navigation */}
          <div>
            <h4 className={`text-white font-normal text-fluid-xs`}>General</h4>
            <ul className="flex flex-col gap-y-1">
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
            <h4 className={`text-white font-normal text-fluid-xs`}>Account</h4>
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
