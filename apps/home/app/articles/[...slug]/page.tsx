import DesktopNavbar from "@omenai/shared-ui-components/components/navbar/desktop/DesktopNavbar";
import ArticleViewWrapper from "./ArticleViewWrapper";

export default async function page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const slug = (await params).id;

  return (
    <div>
      <DesktopNavbar />
      <ArticleViewWrapper slug={slug} />
    </div>
  );
}
