import React from "react";
import CollectionWrapper from "./CollectionWrapper";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";

export default async function page({
  params,
}: {
  params: Promise<{ id: string[] }>;
}) {
  const slug = (await params).id;
  return <CollectionWrapper id={slug[0]} />;
}
