import React from "react";
import InviteForm from "./InviteForm";
import PageLayout from "../PageLayout";

export default async function page({
  searchParams,
}: {
  searchParams: Promise<{ entity: string | undefined }>;
}) {
  const entity = (await searchParams).entity;
  if (!entity) return;
  return (
    <PageLayout>
      <InviteForm entity={entity} />
    </PageLayout>
  );
}
