"use client";

import DashboardIndicator from "./DashboardIndicator";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";

export default function Appbar() {
  const { user } = useAuth({ requiredRole: "admin" });
  return (
    <>
      <div className="flex justify-between items-center w-full pt-5 sticky top-0 z-10 bg-white ">
        <DashboardIndicator admin_name={user.name} />
      </div>
    </>
  );
}
