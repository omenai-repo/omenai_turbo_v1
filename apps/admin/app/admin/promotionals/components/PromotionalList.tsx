"use client";

import { getPromotionalData } from "@omenai/shared-services/promotionals/getPromotionalContent";
import Load from "@omenai/shared-ui-components/components/loader/Load";
import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { canAccessRoute } from "../../../utils/canAccessRoute";
import ForbiddenPage from "../../components/ForbiddenPage";
import PromotionalCard from "./PromotionalCard";

export default function PromotionalList() {
  const { user } = useAuth({ requiredRole: "admin" });

  if (!canAccessRoute(user.access_role, "editorials")) {
    return <ForbiddenPage userRole={user.access_role} />;
  }

  const { data: promotionals, isLoading } = useQuery({
    queryKey: ["fetch_promotional_data"],
    queryFn: async () => {
      const response = await getPromotionalData();
      if (!response.isOk) {
        throw new Error(
          "Something went wrong. Please try again later or contact support"
        );
      }
      return response.data;
    },
  });

  if (isLoading) return <Load />;

  return (
    <div className="mt-6">
      <div
        className="
          grid gap-5
          grid-cols-[repeat(auto-fill,minmax(280px,1fr))]
        "
      >
        {promotionals.map((promotional: any, index: number) => (
          <PromotionalCard
            key={promotional._id || promotional.heading || index}
            headline={promotional.headline}
            subheadline={promotional.subheadline}
            cta={promotional.cta}
            image={promotional.image}
            isAdmin
            id={promotional._id}
          />
        ))}
      </div>
    </div>
  );
}
