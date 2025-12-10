import React from "react";
import InviteForm from "./InviteForm";
import PageLayout from "../PageLayout";
import { redirect } from "next/navigation";

export default async function page({
  searchParams,
}: {
  searchParams: Promise<{ entity: string | undefined }>;
}) {
  const entity = (await searchParams).entity;
  if (!entity) redirect("/register");
  return (
    <PageLayout>
      <InviteForm entity={entity} />
    </PageLayout>
  );
}
