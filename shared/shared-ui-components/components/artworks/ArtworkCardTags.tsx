type ArtworkCardTags = {
  tag: string;
};
export default function ArtworkCardTags({ tag }: ArtworkCardTags) {
  return (
    <div className="w-fit px-2 py-1 border text-[12px] font-normal rounded border-dark/10">
      #{tag}
    </div>
  );
}
