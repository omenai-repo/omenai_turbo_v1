// components/ArticleRenderer.js
import Image from "next/image";
import { format } from "date-fns";
import DOMPurify from "isomorphic-dompurify";
import { EditorialSchemaTypes } from "@omenai/shared-types";
import { getEditorialFileView } from "@omenai/shared-lib/storage/getEditorialCoverFileView";

const ArticleRenderer = ({ article }: { article: EditorialSchemaTypes }) => {
  // Sanitize HTML content from TinyMCE
  const sanitizedContent = DOMPurify.sanitize(article.content);

  const url = getEditorialFileView(article.cover, 1000);
  return (
    <article className="max-w-4xl mx-auto">
      {/* Cover Image */}
      {article.cover && (
        <div className="relative w-full h-[400px] md:h-[500px] mb-8 rounded overflow-hidden">
          <Image
            src={url}
            alt={article.headline}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      {/* Article Header */}
      <header className="mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
          {article.headline}
        </h1>

        {/* Article Meta */}
        <div className="flex items-center text-gray-600 text-sm mb-6">
          <span>
            By <span className="text-red-600">Iyanuoluwa Adenle</span>
          </span>
          <span className="mx-2">•</span>
          <time
            dateTime={
              article.date ? new Date(article.date).toISOString() : undefined
            }
          >
            {article.date
              ? format(new Date(article.date), "MMMM d, yyyy")
              : "Unknown date"}
          </time>
          <span className="mx-2">•</span>
          <span>10 min read</span>
        </div>

        {/* Optional Summary */}
        {article.summary && (
          <div className="bg-gray-50 border-l-4 border-blue-500 p-6 rounded-r-lg mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Summary
            </h2>
            <p className="text-gray-700 leading-relaxed">{article.summary}</p>
          </div>
        )}
      </header>

      {/* Article Content */}
      <div
        className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-p:leading-relaxed prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900 prose-blockquote:border-l-blue-500 prose-blockquote:bg-gray-50 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-code:bg-gray-100 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-img:rounded prose-img:shadow-lg"
        dangerouslySetInnerHTML={{ __html: sanitizedContent }}
      />
    </article>
  );
};

export default ArticleRenderer;
