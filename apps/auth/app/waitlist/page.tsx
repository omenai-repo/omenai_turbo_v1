import React from "react";
import WaitlistForm from "./WaitlistForm";
import PageLayout from "./PageLayout";

export default async function WaitlistPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<{ entity: string | undefined }>;
}>) {
  const entity = (await searchParams).entity;
  if (!entity) return;
  return (
    <PageLayout>
      <WaitlistForm entity={entity} />
    </PageLayout>
  );
}
