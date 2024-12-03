"use client";
import { IndividualLogo } from "../../logo/Logo";
import NavbarLink from "../ui/NavbarLink";
import NavbarActionButtons from "../ui/NavbarActionButtons";
import { CiMenuFries } from "react-icons/ci";
import MobileNavbar from "../mobile/MobileNavbar";
import { actionStore } from "@omenai/shared-state-store/src/actions/ActionStore";
import { useSession } from "next-auth/react";
import LoggedInUser from "../ui/LoggedInUser";
import SearchInput from "../ui/SearchInput";
import { SlMenu } from "react-icons/sl";

export default function DesktopNavbar() {
  const { updateOpenSideNav } = actionStore();
  const session = useSession();

  return (
    <>
      <div className="sticky top-0 z-30 bg-white mb-4 pb-4">
        <nav
          className="px-4 md:px-8 pt-4 text-base text-black font-normal "
          id="navbar"
        >
          <MobileNavbar />
          <div className="w-full flex justify-between items-center">
            <div className="w-auto shrink-0">{/* <IndividualLogo /> */}</div>

            <nav className="px-4 relative hidden sm:flex gap-x-2 w-full">
              <SearchInput />
            </nav>

            <ul className="lg:flex space-x-4 hidden p-4">
              <NavbarLink
                disabled={false}
                text={"Buy artworks"}
                link={"/catalog"}
              />
              <NavbarLink
                disabled={false}
                text={"Pricing"}
                link={"/gallery/pricing"}
              />
              <NavbarLink
                disabled={false}
                text={"Omenai shop"}
                link={"https://omenai.shop"}
              />
              <NavbarLink
                disabled={false}
                text={"Editorials"}
                link={"https://omenai.net"}
              />
            </ul>

            <div className="flex items-center space-x-4">
              {session.status === "authenticated" &&
                session.data.user.role === "user" && (
                  <LoggedInUser user={session.data?.user.name} />
                )}
              {((session.data &&
                (session.data.user.role === "gallery" ||
                  session.data?.user.role === "admin")) ||
                session.status === "unauthenticated") && (
                <NavbarActionButtons />
              )}
              <div className="lg:hidden block">
                <SlMenu
                  className="text-sm"
                  onClick={() => updateOpenSideNav(true)}
                />
              </div>
            </div>
          </div>
        </nav>
      </div>
      <nav className="px-4 relative sm:hidden flex gap-x-2 w-full mb-4">
        <SearchInput />
      </nav>
      <hr className="border-dark/10 mx-4" />
    </>
  );
}
