"use client";
import DashboardIndicator from "./DashboardIndicator";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";

export default function Appbar() {
  const { user } = useAuth({ requiredRole: "artist" });
  return (
    <>
      <div className="flex justify-between items-center w-full pb-4 top-0 z-10">
        <DashboardIndicator
          artist_name={user && user.role === "artist" ? user.name : ""}
        />
      </div>
    </>
  );
}
