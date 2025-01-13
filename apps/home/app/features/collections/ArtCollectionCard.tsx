import Image from "next/image";
import Link from "next/link";

type ArtCollectionCardTypes = {
  title: string;
  url: string;
};
export default function ArtCollectionCard({
  title,
  url,
}: ArtCollectionCardTypes) {
  return (
    <div className="py-4 min-w-[300px] rounded-[20px] relative">
      <Link href={"/collections/" + title}>
        <div className="flex flex-col ">
          <Image
            width={250}
            height={250}
            src={`/images/${url}.png`}
            alt={title + " image"}
            className="min-w-[250px] rounded-[20px] w-auto min-h-[200px] h-[250px] object-cover object-center cursor-pointer"
          />
          <div className="w-fit ring-1 ring-white bg-dark text-white flex flex-col px-3 py-2 left-5 absolute bottom-10 rounded-3xl">
            <p className="text-xs font-light">{title}</p>
          </div>
        </div>
      </Link>
    </div>
  );
}
