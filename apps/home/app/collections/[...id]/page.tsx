import React from "react";
import CollectionWrapper from "./CollectionWrapper";
export const dynamic = "force-dynamic";
export default async function page({
  params,
}: {
  params: Promise<{ id: string[] }>;
}) {
  const slug = (await params).id;
  return <CollectionWrapper id={slug[0]} />;
}
