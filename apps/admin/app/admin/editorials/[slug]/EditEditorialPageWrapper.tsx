"use client";
import { toast_notif } from "@omenai/shared-utils/src/toast_notification";
import { useQuery } from "@tanstack/react-query";

import { getEditorial } from "@omenai/shared-lib/editorials/getSingleEditorial";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { canAccessRoute } from "../../../utils/canAccessRoute";
import ForbiddenPage from "../../components/ForbiddenPage";
import EditorialForm from "./components/EditorialForm";
import { LoadIcon } from "@omenai/shared-ui-components/components/loader/Load";

export default function EditEditorialPageWrapper({
  id,
  slug,
}: Readonly<{
  id: string;
  slug: string;
}>) {
  const { user } = useAuth({ requiredRole: "admin" });

  if (!canAccessRoute(user.access_role, "editorials")) {
    return <ForbiddenPage userRole={user.access_role} />;
  }
  const { data: editorial, isLoading: loading } = useQuery({
    queryKey: ["fetch_admin_editorials", id, slug],
    queryFn: async () => {
      if (!id) {
        throw new Error("Missing ID parameter");
      }

      const response = await getEditorial(id, slug);

      if (!response.isOk) {
        toast_notif(
          "Error fetching editorial, please refresh or contact IT support",
          "error",
        );
        return null;
      }

      return response.data;
    },
    enabled: !!id,
    refetchOnWindowFocus: false,
    staleTime: 0,
    gcTime: 0,
  });
  return (
    <section className="w-full min-h-screen bg-[#FAFAFA]">
      {/* Premium Sticky Header */}
      <header className="sticky top-0 z-20 w-full rounded bg-white/80 backdrop-blur-md border border-neutral-200 px-6 py-5 lg:px-12 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-medium tracking-normal text-neutral-900">
            Editorial Workspace
          </h1>
          <p className="text-sm text-neutral-500 font-light mt-0.5">
            Edit an existing editorial
          </p>
        </div>
      </header>

      {/* Edge-to-Edge Form Canvas */}
      {loading ? (
        <LoadIcon />
      ) : (
        <div className="w-full py-10">
          <div className="w-full bg-white rounded shadow-sm border border-neutral-200 p-8 lg:p-12 transition-all duration-300">
            <EditorialForm article={editorial as any} />
          </div>
        </div>
      )}
    </section>
  );
}
