import React from "react";
import WaitlistForm from "./WaitlistForm";
import PageLayout from "./PageLayout";
import { redirect } from "next/navigation";

export default async function WaitlistPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<{ entity: string | undefined }>;
}>) {
  const entity = (await searchParams).entity;
  if (!entity) redirect("/register");
  return (
    <PageLayout>
      <WaitlistForm entity={entity} />
    </PageLayout>
  );
}
