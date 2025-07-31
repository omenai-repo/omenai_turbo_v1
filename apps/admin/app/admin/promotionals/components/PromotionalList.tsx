"use client";
import { getPromotionalData } from "@omenai/shared-services/promotionals/getPromotionalContent";
import Load from "@omenai/shared-ui-components/components/loader/Load";
import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import router from "next/navigation";
import { canAccessRoute } from "../../../utils/canAccessRoute";
import ForbiddenPage from "../../components/ForbiddenPage";
import PromotionalCard from "./PromotionalCard";

export default function PromotionalList() {
  const { user } = useAuth({ requiredRole: "admin" });

  // Check permissions
  if (!canAccessRoute(user.access_role, "editorials")) {
    return <ForbiddenPage userRole={user.access_role} />;
  }
  const { data: promotionals, isLoading: loading } = useQuery({
    queryKey: ["fetch_promotional_data"],
    queryFn: async () => {
      const response = await getPromotionalData();
      if (!response.isOk)
        throw new Error(
          "Something went wrong. Please try again later or contact suppport"
        );
      return response.data;
    },
  });

  if (loading) return <Load />;

  return (
    <div className="my-10">
      <div className="flex flex-auto flex-wrap grow shrink gap-5">
        {promotionals.map((promotional: any, index: number) => {
          return (
            <div key={promotional.id || promotional.heading || index}>
              <PromotionalCard
                headline={promotional.headline}
                subheadline={promotional.subheadline}
                cta={promotional.cta}
                image={promotional.image}
                isAdmin={true}
                id={promotional._id}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
