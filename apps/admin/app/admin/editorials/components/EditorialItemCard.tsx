import { getEditorialFileView } from "@omenai/shared-lib/storage/getEditorialCoverFileView";
import { base_url } from "@omenai/url-config/src/config";
import Image from "next/image";
import Link from "next/link";
import DeleteEditorialModal from "../modal/DeleteEditorialModal";

export default function EditorialItemCard({ editorial }: { editorial: any }) {
  const imageUrl = editorial.cover
    ? getEditorialFileView(editorial.cover, 600)
    : null;

  return (
    <article
      className="
        relative overflow-hidden rounded-xl
        border border-neutral-200 bg-white
        transition hover:shadow-md
      "
    >
      {/* Image */}
      <div className="relative h-[200px] w-full overflow-hidden bg-neutral-100">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={editorial.headline}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-neutral-400">
            <span className="text-sm">No cover image</span>
          </div>
        )}

        {/* Admin delete */}
        <DeleteEditorialModal
          document_id={editorial.$id}
          image_id={editorial.cover}
        />

        {/* Image overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
      </div>

      {/* Content */}
      <div className="flex h-[200px] flex-col justify-between p-5">
        <h2 className="line-clamp-3 text-base font-semibold text-neutral-900">
          {editorial.headline}
        </h2>

        <div className="mt-4 flex items-center justify-between">
          <Link
            href={`${base_url()}/articles/${editorial.slug}?id=${editorial.$id}`}
            rel="noopener noreferrer"
            className="text-sm font-medium text-neutral-700 hover:text-neutral-900"
          >
            Read article →
          </Link>

          <span className="text-xs text-neutral-400">Published</span>
        </div>
      </div>
    </article>
  );
}
