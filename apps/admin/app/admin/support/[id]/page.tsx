import SingleTicketPage from "./components/PageWrapper";
export default async function page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const slug = (await params).id[0];

  return <SingleTicketPage id={slug} />;
}
