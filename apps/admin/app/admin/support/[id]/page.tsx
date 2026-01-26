import SingleTicketPage from "./components/PageWrapper";
export default async function page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const slug = (await params).id;

  return <SingleTicketPage id={slug} />;
}
