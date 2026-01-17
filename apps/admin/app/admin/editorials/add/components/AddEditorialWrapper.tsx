"use client";

import EditorialForm from "./EditorialForm";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { canAccessRoute } from "../../../../utils/canAccessRoute";
import ForbiddenPage from "../../../components/ForbiddenPage";

export default function AddEditorialWrapper() {
  const { user } = useAuth({ requiredRole: "admin" });

  if (!canAccessRoute(user.access_role, "editorials")) {
    return <ForbiddenPage userRole={user.access_role} />;
  }

  return (
    <section className="max-w-4xl mx-auto space-y-6">
      {/* Page header */}
      <header className="space-y-1">
        <h1 className="text-lg font-semibold text-neutral-900">
          New editorial
        </h1>
        <p className="text-sm text-neutral-500">
          Create and publish a long-form editorial article.
        </p>
      </header>

      {/* Form surface */}
      <div className="rounded border border-neutral-200 bg-white shadow-sm p-6">
        <EditorialForm />
      </div>
    </section>
  );
}
