import Image from "next/image";
import Link from "next/link";

type ArtCollectionCardTypes = {
  title: string;
  url: string;
  isCatalog?: boolean;
};
export default function ArtCollectionCard({
  title,
  url,
  isCatalog,
}: ArtCollectionCardTypes) {
  const safeSlug = encodeURIComponent(title)
    .replace(/\(/g, "%28")
    .replace(/\)/g, "%29");
  return (
    <div className="py-4 min-w-[300px] rounded relative">
      <Link href={`/collections/${safeSlug}`}>
        <div className="flex flex-col ">
          <Image
            width={300}
            height={!isCatalog ? 250 : 180}
            src={`/images/${url}.png`}
            alt={title + " image"}
            className={`min-w-[300px] rounded w-full min-h-[200px] h-[250px] object-cover object-center cursor-pointer`}
          />
          <div className="w-fit bg-dark hover:ring-1 hover:ring-white duration-300 text-white flex flex-col px-4 py-1 left-5 absolute bottom-10 rounded font-semibold ">
            <p className="text-fluid-xs font-light">{title}</p>
          </div>
        </div>
      </Link>
    </div>
  );
}
