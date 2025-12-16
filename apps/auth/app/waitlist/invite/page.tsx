import React from "react";
import InviteForm from "./InviteForm";
import PageLayout from "../PageLayout";
import { redirect } from "next/navigation";

export default async function page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const entity = (await searchParams).entity;
  if (!entity || (entity !== "artist" && entity !== "gallery"))
    redirect("/register");

  const email = (await searchParams).email;
  const inviteCode = (await searchParams).inviteCode;
  return (
    <PageLayout>
      <InviteForm entity={entity} email={email} inviteCode={inviteCode} />
    </PageLayout>
  );
}
