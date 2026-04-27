"use client";

import EditorialForm from "./EditorialForm";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { canAccessRoute } from "../../../../utils/canAccessRoute";
import ForbiddenPage from "../../../components/ForbiddenPage";

export default function AddEditorialWrapper() {
  const { user } = useAuth({ requiredRole: "admin" });

  if (!canAccessRoute(user.access_role, "mid_level_access")) {
    return <ForbiddenPage userRole={user.access_role} />;
  }

  return (
    <section className="w-full min-h-screen bg-[#FAFAFA]">
      {/* Premium Sticky Header */}
      <header className="sticky top-0 z-20 w-full rounded bg-white/80 backdrop-blur-md border border-neutral-200 px-6 py-5 lg:px-12 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-medium tracking-normal text-neutral-900">
            Editorial Workspace
          </h1>
          <p className="text-sm text-neutral-500 font-normal mt-0.5">
            Draft a new editorial
          </p>
        </div>
      </header>

      {/* Edge-to-Edge Form Canvas */}
      <div className="w-full py-10">
        <div className="w-full bg-white rounded shadow-sm border border-neutral-200 p-8 lg:p-12 transition-all duration-300">
          <EditorialForm />
        </div>
      </div>
    </section>
  );
}
