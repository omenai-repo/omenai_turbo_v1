"use client";

import { useContext } from "react";
import DashboardIndicator from "./DashboardIndicator";
import { SessionContext } from "@omenai/package-provider/SessionProvider";

export default function Appbar() {
  const { session } = useContext(SessionContext);
  return (
    <>
      <div className="flex justify-between items-center w-full px-5 pt-5 sticky top-0 z-10 bg-white ">
        <DashboardIndicator
          admin_name={session?.admin as string}
          gallery_name={session?.name}
          gallery_verified={session?.gallery_verified as boolean}
        />
      </div>
    </>
  );
}
