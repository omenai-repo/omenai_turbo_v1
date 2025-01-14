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
  return (
    <div className="py-4 min-w-[300px] rounded-[20px] relative">
      <Link href={"/collections/" + title}>
        <div className="flex flex-col ">
          <Image
            width={250}
            height={!isCatalog ? 250 : 180}
            src={`/images/${url}.png`}
            alt={title + " image"}
            className={`min-w-[250px] rounded-[20px] w-auto min-h-[180px] ${isCatalog ? "h-[180px]" : "h-[250px]"} object-cover object-center cursor-pointer`}
          />
          <div className="w-fit ring-1 ring-white bg-dark text-white flex flex-col px-3 py-2 left-5 absolute bottom-10 rounded-3xl">
            <p className="text-xs font-light">{title}</p>
          </div>
        </div>
      </Link>
    </div>
  );
}
