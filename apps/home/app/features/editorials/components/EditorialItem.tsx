import { getEditorialCoverFileView } from "@omenai/shared-lib/storage/getEditorialCoverFileView";
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
  console.log(cover);
  let url;

  if (cover) {
    url = getEditorialCoverFileView(cover);
  }

  return (
    <>
      {" "}
      <div className="px-2 py-8 bg-transaparent flex flex-col gap-[1rem] h-full w-full">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url}
            alt={title}
            className="w-full object-cover aspect-square object-top"
          />
        ) : (
          <p>No cover</p>
        )}
        <div className="flex flex-col gap-[1rem] mx-0">
          <div className="flex flex-col sm:flex-row gap-2 items-center">
            <p className="text-dark/60 text-xs">{minutes} minutes read</p>{" "}
            {/* <span className="font-normal">•</span> */}
            {/* <span className="font-normal">•</span> */}
          </div>
          <div className="flex flex-col gap-2">
            <h1 className="text-sm lg:text-md leading-tight font-normal ">
              {title}
            </h1>

            {/* <p className="text-[#858585] italic text-base">{summary}</p> */}
          </div>
          <a href={"https://" + link} target="_blank" rel="noopener noreferrer">
            <p className="flex items-center gap-x-2 underline text-xs">
              Read full article <MdArrowRightAlt />
            </p>
          </a>
        </div>
      </div>
    </>
  );
}
