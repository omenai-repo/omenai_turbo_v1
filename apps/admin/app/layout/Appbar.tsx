"use client";

import DashboardIndicator from "./DashboardIndicator";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";

export default function Appbar() {
  const { user } = useAuth({ requiredRole: "admin" });
  return (
    <>
      <div className="flex justify-between items-center w-full pb-4 ">
        <DashboardIndicator
          admin_name={user.name as string}
          access_role={user.access_role}
        />
      </div>
    </>
  );
}
