import HorizontalArtworkCardLoader from "@omenai/shared-ui-components/components/loader/HorizontalArtworkCardsLoader";

export function SectionLoaderContainers({ title }: { title: string }) {
  return (
    <div className="p-4 relative">
      <div className="space-y-1 my-5">
        <h1 className="text-md font-normal">{title}</h1>
      </div>
      <HorizontalArtworkCardLoader />
    </div>
  );
}
