import { getEditorialFileView } from "@omenai/shared-lib/storage/getEditorialCoverFileView";
import { base_url } from "@omenai/url-config/src/config";
import Image from "next/image";
import Link from "next/link";
import DeleteEditorialModal from "../modal/DeleteEditorialModal";

export default function EditorialItemCard({ editorial }: { editorial: any }) {
  const url = editorial.cover
    ? getEditorialFileView(editorial.cover, 300)
    : null;

  const document_id = editorial.$id;
  const image_id = editorial.cover;

  return (
    <div className="group relative bg-white rounded overflow-hidden transition-all duration-500 transform hover:-translate-y-1 h-[420px] max-w-[320px] min-w-[300px] xxl:w-full w-[300px] xxm:w-[350px] xxm:max-w-[350px] border border-dark/30">
      {/* Image Section */}
      <div className="relative h-[220px] overflow-hidden">
        {url ? (
          <Image
            src={url}
            alt={editorial.headline}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-dark/30 to-gray-200 flex items-center justify-center">
            <div className="text-gray-400 text-center">
              <svg
                className="w-16 h-16 mx-auto mb-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-sm font-medium">No cover image</p>
            </div>
          </div>
        )}

        <DeleteEditorialModal document_id={document_id} image_id={image_id} />

        {/* Subtle overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Content Section */}
      <div className="p-6 flex flex-col justify-between h-[200px] bg-white">
        {/* Title */}
        <h1 className="text-gray-900 text-lg font-bold leading-tight line-clamp-3 mb-4 group-hover:text-gray-700 transition-colors duration-300">
          {editorial.headline}
        </h1>

        {/* Bottom section */}
        <div className="flex items-center gap-4 mt-auto">
          <Link
            href={`${base_url()}/articles/${editorial.slug}?id=${editorial.$id}`}
            rel="noopener noreferrer"
            className="flex-shrink-0"
          >
            <button className="bg-gray-900 text-white px-6 py-2.5 rounded text-sm font-medium hover:bg-gray-800 transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg whitespace-nowrap group-hover:bg-black">
              Read Article
            </button>
          </Link>

          {/* Decorative line */}
          <div className="flex-1 h-px bg-gradient-to-r from-dark/30 via-dark/20 to-transparent" />
        </div>
      </div>

      {/* Subtle border accent */}
      <div className="absolute inset-0 rounded-3xl border border-transparent transition-colors duration-300 pointer-events-none" />
    </div>
  );
}
