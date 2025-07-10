import PageTitle from "../../../components/PageTitle";
import ArtworkPricing from "./ArtworkPricing";
export const dynamic = "force-dynamic";
export default function page() {
  return (
    <>
      <PageTitle title="Get artwork pricing" />
      <div className="my-6 h-[calc(70vh-3rem)] grid place-items-center">
        <ArtworkPricing />
      </div>
    </>
  );
}
