import ArtworkPricingWrapper from "./ArtworkPricingWrapper";
export const dynamic = "force-dynamic";
export default function page() {
  return (
    <>
      <div className="my-6 h-[calc(100dvh-3rem)] grid place-items-center">
        <ArtworkPricingWrapper />
      </div>
    </>
  );
}
