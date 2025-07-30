"use client";
import EditorialForm from "./EditorialForm";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { canAccessRoute } from "../../../../utils/canAccessRoute";
import ForbiddenPage from "../../../components/ForbiddenPage";

export default function AddEditorialWrapper() {
  const { user } = useAuth({ requiredRole: "admin" });

  // Check permissions
  if (!canAccessRoute(user.access_role, "editorials")) {
    return <ForbiddenPage userRole={user.access_role} />;
  }
  return (
    <div>
      <div className="flex justify-between items-center">
        <h1 className="text-fluid-lg font-semibold">Upload an Editorial</h1>
      </div>
      <div className="">
        <EditorialForm />
      </div>
    </div>
  );
}
