"use client";
import { useQuery } from "@tanstack/react-query";
import { notFound, useSearchParams } from "next/navigation";
import { checkAdminActivation } from "@omenai/shared-services/admin/check_admin_activation";
import { HomeLoad } from "@omenai/shared-ui-components/components/loader/Load";
import ActivationFormWrapper from "./ActivationFormWrapper";
export default function ActivationWrapper() {
  const query = useSearchParams().get("token");

  if (!query) return notFound();

  const { data: isAdminActive, isLoading: loading } = useQuery({
    queryKey: ["checkAdminActive", query],
    queryFn: async () => {
      const res = await checkAdminActivation(query);
      if (!res.isOk) return null;

      return res.data;
    },
  });

  if (loading) return <HomeLoad />;

  if (isAdminActive === null || !isAdminActive) return notFound();

  return <ActivationFormWrapper />;
}
