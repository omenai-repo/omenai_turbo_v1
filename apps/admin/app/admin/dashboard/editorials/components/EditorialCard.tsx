import { getEditorialCoverFileView } from "@omenai/shared-lib/storage/getEditorialCoverFileView";
import { adminModals } from "@omenai/shared-state-store/src/admin/AdminModalsStore";

import { GoTrash } from "react-icons/go";
import { MdArrowRightAlt } from "react-icons/md";

export default function EditorialCard({
  cover,
  title,
  minutes,
  link,
  date,
  documentId,
}: {
  cover: string;
  title: string;
  minutes: number;
  link: string;
  date: Date | null;
  documentId: string;
}) {
  const url = getEditorialCoverFileView(cover);

  const { setShowDeleteEditorialModal } = adminModals();

  return (
    <div className="w-full">
      <div className="relative">
        <img
          src={url}
          alt={title}
          className="w-full object-cover aspect-square object-top"
        />
        <div className="h-full w-full absolute top-0 left-0 hover:bg-dark/30 ease-in duration-300 flex justify-end p-[20px] group/overlay overflow-hidden">
          <div
            onClick={() => setShowDeleteEditorialModal(true, documentId)}
            className="opacity-0 group-hover/overlay:opacity-100 group-hover/overlay:translate-x-0 flex ease-in duration-300 translate-x-10  items-center text-[14px] text-red-600 gap-2 px-3 py-2 rounded-full bg-gray-100 h-fit cursor-pointer"
          >
            <GoTrash />
            <p>Delete editorial</p>
          </div>
        </div>
      </div>
      <div className="mt-3 space-y-2">
        <p className="text-gray-700/60 text-[14px]">{minutes} minutes read</p>
        <h1 className="text-sm lg:text-md leading-tight font-normal">
          {title}
        </h1>
        {/* <p className="text-gray-700/60">Posted on <span className="text-gray-700/90 font-medium">{date !== null && date?.getDate()}</span></p> */}
        <a href={"https://" + link} target="_blank" rel="noopener noreferrer">
          <p className="flex items-center gap-x-2 underline text-[14px]">
            Read full article <MdArrowRightAlt />
          </p>
        </a>
      </div>
    </div>
  );
}
