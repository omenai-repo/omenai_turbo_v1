import React from "react";
import EditEditorialPageWrapper from "./EditEditorialPageWrapper";
import { redirect } from "next/navigation";
import { admin_url } from "@omenai/url-config/src/config";

export default async function EditEditorialPage({
  params,
  searchParams,
}: Readonly<{
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ id: string | undefined }>;
}>) {
  const { slug } = await params;
  const { id } = await searchParams;
  if (!id) {
    redirect(`${admin_url()}/admin/editorials`);
  }
  return <EditEditorialPageWrapper slug={slug} id={id} />;
}
