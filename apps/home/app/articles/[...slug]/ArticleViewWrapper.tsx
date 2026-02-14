"use client";

import { useQuery } from "@tanstack/react-query";
import { notFound, useSearchParams } from "next/navigation";
import { getEditorial } from "@omenai/shared-lib/editorials/getSingleEditorial";
import { toast_notif } from "@omenai/shared-utils/src/toast_notification";
import Load from "@omenai/shared-ui-components/components/loader/Load";
import ArticleRenderer from "./ArticleRenderer";
import DesktopNavbar from "@omenai/shared-ui-components/components/navbar/desktop/DesktopNavbar";
import Footer from "@omenai/shared-ui-components/components/footer/Footer";

export default function ArticleViewWrapper({ slug }: { slug: string }) {
  const params = useSearchParams();
  const id = params.get("id");

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
          "error"
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

  // Handle different states
  if (!id) notFound();

  if (loading)
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white">
        <Load />
      </div>
    );

  if (!editorial) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white">
        <p className="font-mono text-xs uppercase tracking-widest text-neutral-400">
          Editorial unavailable.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <DesktopNavbar />
      <main className="pt-8 pb-32">
        <ArticleRenderer article={editorial as any} />
      </main>
      <Footer />
    </div>
  );
}
