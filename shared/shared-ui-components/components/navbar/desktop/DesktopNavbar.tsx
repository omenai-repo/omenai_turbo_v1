"use client";
import NavbarLink from "../ui/NavbarLink";
import NavbarActionButtons from "../ui/NavbarActionButtons";
import MobileNavbar from "../mobile/MobileNavbar";
import { actionStore } from "@omenai/shared-state-store/src/actions/ActionStore";
import LoggedInUser from "../ui/LoggedInUser";
import { SlMenu } from "react-icons/sl";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { IndividualLogo } from "../../logo/Logo";
import { base_url, dashboard_url } from "@omenai/url-config/src/config";

const navbarlinks = [
  { text: "Collect", link: `${base_url()}/catalog` },
  // { text: "Shop", link: "https://omenai.shop" },
  { text: "Editorials", link: `${base_url()}/articles` },
];
export default function DesktopNavbar() {
  const { updateOpenSideNav } = actionStore();
  const { user } = useAuth({ requiredRole: "user" });

  const navbarlinks = [
    { text: "Collect", link: `${base_url()}/catalog` },
    // { text: "Shop", link: "https://omenai.shop" },
    { text: "Editorials", link: `${base_url()}/articles` },
    ...(user && user.role !== "user"
      ? [
          {
            text: "Go to dashboard",
            link: `${dashboard_url()}/${user.role === "artist" ? "artist/app/" : "gallery/"}overview`,
          },
        ]
      : []),
  ];
  return (
    <>
      <MobileNavbar />
      <div className="flex justify-between items-center sticky top-0 z-30 bg-white py-6">
        <div>
          <IndividualLogo />
        </div>
        <ul className="hidden md:flex gap-x-6">
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
          {user?.role === "user" && (
            <LoggedInUser user={user.name} email={user.email} />
          )}
          {!user && <NavbarActionButtons />}
          {user && user.role !== "user" && <NavbarActionButtons />}
          <div className="md:hidden block">
            <SlMenu
              className="text-fluid-sm"
              onClick={() => updateOpenSideNav(true)}
            />
          </div>
        </div>
      </div>
    </>
  );
}
