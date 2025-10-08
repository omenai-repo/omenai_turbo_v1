import Image from "next/image";
import Link from "next/link";

export default function ArtCollectionCard({
  title,
  url,
}: {
  title: string;
  url: string;
}) {
  const safeSlug = encodeURIComponent(title)
    .replace(/\(/g, "%28")
    .replace(/\)/g, "%29");
  return (
    <div className="py-4 min-w-[300px]">
      <Link href={`/collections/${safeSlug}`}>
        <div className="flex flex-col ">
          <Image
            width={300}
            height={250}
            src={`/images/${url}.jpg`}
            alt={title + " image"}
            className="min-w-[300px] w-[300px] min-h-[250px] h-[250px] object-cover object-top cursor-pointer"
          />
          <div className="bg-[#FAFAFA] flex flex-col p-4">
            <p className="text-fluid-xxs font-normal">{title}</p>
          </div>
        </div>
      </Link>
    </div>
  );
}
