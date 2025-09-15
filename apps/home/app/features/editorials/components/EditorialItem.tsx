import { getEditorialFileView } from "@omenai/shared-lib/storage/getEditorialCoverFileView";
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
    url = getEditorialFileView(cover);
  }

  return (
    <>
      <div className="p-5 relative bg-dark flex flex-col gap-[1.5rem] rounded h-[400px] max-w-[300px] min-w-[300px] xxl:w-full w-[300px] xxm:w-[350px] xxm:max-w-[350px]">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <Image
            src={url!}
            alt={title}
            width={200}
            height={200}
            className="h-[200px] w-full rounded object-cover aspect-square object-top"
          />
        ) : (
          <p>No cover</p>
        )}
        <div className="flex flex-col gap-[1rem] py-2 mx-0">
          <h1 className="text-fluid-xs xs:text-fluid-base text-white leading-tight font-normal ">
            {title}
          </h1>
          <p>{summary}</p>
          <div className="absolute bottom-5 left-0 px-4 flex w-full justify-between items-center gap-4">
            <Link
              href={"https://" + link}
              target="_blank"
              rel="noopener noreferrer"
            >
              <button className="flex bg-white text-dark px-4 py-2 items-center gap-x-2 rounded text-fluid-xs whitespace-nowrap">
                Read full article
              </button>
            </Link>
            <hr className="border border-white w-full pr-5" />
          </div>
        </div>
      </div>
    </>
  );
}
