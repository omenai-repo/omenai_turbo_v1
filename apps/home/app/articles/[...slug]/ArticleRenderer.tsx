import Image from "next/image";
import { format } from "date-fns";
import DOMPurify from "isomorphic-dompurify";
import { EditorialSchemaTypes } from "@omenai/shared-types";
import { getEditorialFileView } from "@omenai/shared-lib/storage/getEditorialCoverFileView";

const ArticleRenderer = ({ article }: { article: EditorialSchemaTypes }) => {
  // Sanitize HTML content from TinyMCE
  const sanitizedContent = DOMPurify.sanitize(article.content);
  const url = getEditorialFileView(article.cover, 1200);

  return (
    <article className="w-full">
      {/* 1. THE MASTHEAD (Header) */}
      <header className="container mx-auto max-w-4xl px-6 text-center mb-16">
        {/* Meta Data Row */}
        <div className="mb-8 flex items-center justify-center gap-4 border-b border-dark pb-6">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500">
            {article.date
              ? format(new Date(article.date), "MMMM d, yyyy")
              : "Date Unknown"}
          </span>
          <span className="h-3 w-[1px] bg-neutral-300"></span>
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500">
            Editorial
          </span>
        </div>

        {/* Headline */}
        <h1 className="font-serif text-5xl md:text-7xl italic leading-[1.1] text-dark tracking-tight mb-8">
          {article.headline}
        </h1>

        {/* Byline */}
        <div className="flex justify-center">
          <p className="font-mono text-xs uppercase tracking-widest text-dark">
            Words by{" "}
            <span className="border-b border-dark pb-0.5">
              {"Iyanuoluwa Adenle"}
            </span>
          </p>
        </div>
      </header>

      {/* 2. CINEMATIC COVER IMAGE */}
      {article.cover && (
        <div className="relative mb-20 h-[50vh] w-full overflow-hidden md:h-[70vh]">
          <Image
            src={url}
            alt={article.headline}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      {/* 3. THE MANUSCRIPT (Body) */}
      <div className="container mx-auto max-w-3xl px-6">
        {/* Abstract / Summary (The "Dek") */}
        {article.summary && (
          <div className="mb-16 text-center">
            <p className="font-serif text-xl md:text-2xl leading-relaxed text-neutral-600 italic">
              {article.summary}
            </p>
            <div className="mx-auto mt-12 h-[1px] w-24 bg-dark"></div>
          </div>
        )}

        {/* Main Content */}
        <div
          className={`
            prose prose-lg max-w-none 
            prose-headings:font-serif prose-headings:font-normal prose-headings:italic prose-headings:text-dark
            prose-p:font-sans prose-p:text-base prose-p:leading-8 prose-p:text-neutral-800
            prose-a:text-dark prose-a:underline prose-a:underline-offset-4 prose-a:decoration-1 hover:prose-a:decoration-2
            prose-strong:font-bold prose-strong:text-dark
            prose-blockquote:border-l-2 prose-blockquote:border-dark prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:text-2xl prose-blockquote:font-serif prose-blockquote:not-italic prose-blockquote:text-neutral-900
            prose-img:my-12 prose-img:w-full prose-img:shadow-none
            prose-ul:list-disc prose-ul:pl-6
            prose-ol:list-decimal prose-ol:pl-6
          `}
          dangerouslySetInnerHTML={{ __html: sanitizedContent }}
        />

        {/* 4. FOOTER SIGN-OFF */}
        <div className="mt-24 mb-12 flex justify-center">
          <span className="font-serif text-3xl italic text-neutral-300">
            Fin.
          </span>
        </div>
      </div>
    </article>
  );
};

export default ArticleRenderer;
