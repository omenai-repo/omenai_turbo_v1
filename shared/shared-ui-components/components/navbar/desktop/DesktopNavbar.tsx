"use client";
import NavbarLink from "../ui/NavbarLink";
import NavbarActionButtons from "../ui/NavbarActionButtons";
import MobileNavbar from "../mobile/MobileNavbar";
import { actionStore } from "@omenai/shared-state-store/src/actions/ActionStore";
import LoggedInUser from "../ui/LoggedInUser";
import SearchInput from "../ui/SearchInput";
import { SlMenu } from "react-icons/sl";
import { useContext } from "react";
import { SessionContext } from "@omenai/package-provider/SessionProvider";
import { IndividualLogo } from "../../logo/Logo";

const navbarlinks = [
  { text: "Buy artworks", link: "/catalog" },
  { text: "Omenai shop", link: "https://omenai.shop" },
  { text: "Editorials", link: "/" },
  { text: "Pricing", link: "/gallery/pricing" },
];
export default function DesktopNavbar() {
  const { updateOpenSideNav } = actionStore();

  const { session } = useContext(SessionContext);
  return (
    <>
      <div className="flex justify-between p-5">
        <div>
          <IndividualLogo />
        </div>
        <ul className="flex gap-x-6 ">
          {navbarlinks.map((item) => {
            return (
              <NavbarLink
                key={item.link}
                disabled={false}
                text={item.text}
                link={item.link}
              />
            );
          })}
        </ul>
        <div className="flex items-center space-x-4">
          {session && session.role === "user" && (
            <LoggedInUser user={session.name} />
          )}
          {!session && <NavbarActionButtons />}
          {session &&
            (session.role === "gallery" || session.role === "admin") && (
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
    </>
  );
}
