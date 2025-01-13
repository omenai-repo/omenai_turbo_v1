import { getEditorialCoverFileView } from "@omenai/shared-lib/storage/getEditorialCoverFileView";
import Image from "next/image";
import Link from "next/link";
import { MdArrowRightAlt } from "react-icons/md";

export type EditorialItemProps = {
  title: string;
  date: string;
  minutes: string;
  cover: string;
  summary: string;
  $id: string;
  link: string;
};
export default function EditorialItem({
  title,
  date,
  minutes,
  cover,
  summary,
  $id,
  link,
}: EditorialItemProps) {
  let url;

  if (cover) {
    url = getEditorialCoverFileView(cover);
  }

  return (
    <>
      <div className="p-8 bg-dark flex flex-col gap-[1rem] rounded-[20px] min-h-[500px] max-w-[400px] min-w-[300px] xxl:w-full w-[300px]">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <Image
            src={url!}
            alt={title}
            width={250}
            height={250}
            className="h-[250px] w-full rounded-[20px] object-cover aspect-square object-top"
          />
        ) : (
          <p>No cover</p>
        )}
        <div className="flex flex-col gap-[1.5rem] mx-0">
          <div className="flex self-end bg-[#858585]/50 px-3 py-1.5 rounded-full font-[200] ring-1 ring-white text-white text-xs w-auto">
            {minutes} minutes read
          </div>{" "}
          <h1 className="text-xs xs:text-base text-white leading-tight font-normal ">
            {title}
          </h1>
          <div className="flex justify-between items-center gap-4">
            <Link
              href={"https://" + link}
              target="_blank"
              rel="noopener noreferrer"
            >
              <button className="flex bg-white text-dark px-4 py-2 items-center gap-x-2 rounded-full text-xs whitespace-nowrap">
                Read full article
              </button>
            </Link>
            <hr className="border border-white w-full" />
          </div>
        </div>
      </div>
    </>
  );
}
