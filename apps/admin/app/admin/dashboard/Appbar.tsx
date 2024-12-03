"use client";

import { CiMenuFries } from "react-icons/ci";
import DashboardIndicator from "./DashboardIndicator";
import IconWrapper from "./IconWrapper";
import { adminNavigationActions } from "@omenai/shared-state-store/src/admin/AdminNavigationStore";

export default function Appbar() {
  const { openMobileNav, setOpenMobileNav } = adminNavigationActions();
  return (
    <>
      <div className="flex justify-between items-center w-full px-5 rounded-md sticky top-0 z-10 bg-white py-5 border-b border-dark/10 ">
        <DashboardIndicator />
        <IconWrapper
          onClick={() => setOpenMobileNav()}
          className={`${openMobileNav ? "hidden" : "false"} block md:hidden`}
        >
          <CiMenuFries />
        </IconWrapper>
      </div>
    </>
  );
}
