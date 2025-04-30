import Image from "next/image";
import Link from "next/link";

export default function ArtCollectionCard({
  title,
  url,
}: {
  title: string;
  url: string;
}) {
  return (
    <div className="py-4 min-w-[300px]">
      <Link href={"/collections/" + title}>
        <div className="flex flex-col ">
          <Image
            width={250}
            height={250}
            src={`/images/${url}.jpg`}
            alt={title + " image"}
            className="min-w-[250px] w-auto min-h-[200px] h-[250px] object-cover object-top cursor-pointer"
          />
          <div className="bg-[#FAFAFA] flex flex-col p-4">
            <p className="text-fluid-xs font-light">{title}</p>
            {/* <span className="w-fit text-fluid-xs font-light text-[#858585] border-none">
                    Omenai&apos;s best picks
                    </span> */}
          </div>
        </div>
      </Link>
    </div>
  );
}
