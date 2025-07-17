import { getEditorialFileView } from "@omenai/shared-lib/storage/getEditorialCoverFileView";
import { EditorialSchemaTypes } from "@omenai/shared-types";
import { base_url } from "@omenai/url-config/src/config";
import Image from "next/image";
import Link from "next/link";

export default function EditorialItemCard({
  editorial,
}: {
  editorial: EditorialSchemaTypes;
}) {
  let url;

  if (editorial.cover) {
    url = getEditorialFileView(editorial.cover, 300);
  }

  return (
    <>
      <div className="p-5 relative bg-dark flex flex-col gap-[1.5rem] rounded-[10px] h-[400px] max-w-[300px] min-w-[300px] xxl:w-full w-[300px] xxm:w-[350px] xxm:max-w-[350px]">
        {editorial.cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <Image
            src={url!}
            alt={editorial.headline}
            width={200}
            height={200}
            className="h-[200px] w-full rounded-[10px] object-cover aspect-square object-top"
          />
        ) : (
          <p>No cover</p>
        )}
        <div className="flex flex-col gap-[1rem] py-2 mx-0">
          <h1 className="text-fluid-xs xs:text-fluid-base text-white leading-tight font-normal ">
            {editorial.headline}
          </h1>
          {/* <p className="text-white">{editorial.summary}</p> */}
          <div className="absolute bottom-5 left-0 px-4 flex w-full justify-between items-center gap-4">
            <Link
              href={`${base_url()}/article/${editorial.slug}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <button className="flex bg-white text-dark px-4 py-2 items-center gap-x-2 rounded-full text-fluid-xs whitespace-nowrap">
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
