import { getEditorialFileView } from "@omenai/shared-lib/storage/getEditorialCoverFileView";
import { EditorialSchemaTypes } from "@omenai/shared-types";
import Image from "next/image";
import { formatISODate } from "@omenai/shared-utils/src/formatISODate";
import { Button } from "@mantine/core";
import Link from "next/link";
import { Models } from "appwrite";

export default function ArticleCard({
  article,
}: {
  article: Models.DefaultRow;
}) {
  const url = getEditorialFileView(article.cover, 300);

  return (
    <div className="h-full flex flex-col bg-white rounded overflow-hidden shadow-sm">
      {/* Image Section - Fixed height */}
      <div className="flex-shrink-0">
        <Image
          alt={article.headline}
          src={url}
          height={300}
          width={300}
          className="w-full h-[200px] object-cover ring-1 ring-[#f1f1f1] rounded-t-lg"
        />
      </div>

      {/* Content Section - Flexible height */}
      <div className="flex flex-col flex-grow p-4 space-y-3">
        {/* Date - Fixed height */}
        <p className="font-light text-fluid-xxs text-gray-600 flex-shrink-0">
          {article.date ? formatISODate(article.date) : "27, February 2025"}
        </p>

        {/* Title - Flexible height but contained */}
        <h3 className="font-semibold text-fluid-base flex-grow leading-tight line-clamp-3">
          {article.headline}
        </h3>

        {/* Button - Fixed at bottom */}
        <div className="flex-shrink-0 mt-auto pt-3">
          <Link href={`/articles/${article.slug}?id=${article.$id}`}>
            <button className="duration-300 rounded h-[30px] px-4 w-fit text-center text-fluid-xxs flex items-center justify-center bg-dark text-white cursor-pointer hover:bg-dark/80 transition-colors">
              View Editorial
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
