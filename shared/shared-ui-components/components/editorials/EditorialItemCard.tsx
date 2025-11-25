import { Image as ImageIcon, ArrowRight } from "lucide-react";
import Link from "next/link";
import { base_url } from "@omenai/url-config/src/config";
import { getEditorialFileView } from "@omenai/shared-lib/storage/getEditorialCoverFileView";
// Note: Next.js 'Image' and 'Link' are replaced with standard HTML elements for rendering in this environment.
export default function EditorialItemCard({ editorial }: { editorial: any }) {
  const url = editorial.cover
    ? getEditorialFileView(editorial.cover, 300)
    : null;

  return (
    // Card Container: Sleek floating effect with subtle shadow and rounded corners.
    <div
      className="group relative bg-white rounded-xl transition-all duration-300 
                    transform  h-[420px] w-full max-w-[330px]  border border-slate-200 overflow-hidden"
    >
      {/* Image Section */}
      <div className="relative h-[220px] overflow-hidden">
        {url ? (
          // Image with Hover Effect: Subtle zoom and brightness change
          <img
            src={url}
            alt={editorial.headline}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.05] group-hover:brightness-90"
          />
        ) : (
          // Placeholder Section
          <div className="h-full w-full bg-slate-800 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <ImageIcon className="w-10 h-10 mx-auto mb-2 text-slate-500" />
              <p className="text-sm font-medium text-slate-400">
                No Cover Image
              </p>
            </div>
          </div>
        )}

        {/* Dynamic Image Overlay (Dark Gradient on Hover) */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Content Section */}
      <div className="p-6 flex flex-col h-[200px] bg-white">
        {/* Title */}
        <h1 className="text-gray-900 text-xl font-semibold leading-snug line-clamp-3 mb-4 transition-colors duration-300 group-hover:text-slate-700">
          {editorial.headline}
        </h1>

        {/* Bottom Section: Read Button and Decorator */}
        <div className="mt-auto flex items-center justify-between">
          {/* Read Article Link: Sleek, integrated button style */}
          <Link
            href={`${base_url()}/articles/${editorial.slug}?id=${editorial.$id}`}
            rel="noopener noreferrer"
            className="inline-flex items-center text-sm font-medium text-slate-700 hover:text-black transition-colors duration-300 group-hover:text-black"
          >
            Read Article
            <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>

          {/* Decorative Time/Date/Accent (Optional: Add real time data here) */}
          <div className="text-xs font-mono text-slate-400 uppercase tracking-widest">
            {new Date(editorial.date).toLocaleDateString("en-US", {
              month: "short",
              year: "numeric",
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
