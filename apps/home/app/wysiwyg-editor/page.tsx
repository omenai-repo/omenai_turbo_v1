"use client";
import React, { useRef, useState } from "react";
import { Editor } from "@tinymce/tinymce-react";
import DOMPurify from "dompurify";
import { toast } from "sonner";
import { LoadSmall } from "@omenai/shared-ui-components/components/loader/Load";
import DesktopNavbar from "@omenai/shared-ui-components/components/navbar/desktop/DesktopNavbar";

export default function WYSIWIG_Editor() {
  const editorRef = useRef<any>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [renderedHTML, setRenderedHTML] = useState<any>(null);

  const log = () => {
    setIsLoading(true);
    if (editorRef.current) {
      const editorContent = editorRef.current.getContent();
      setRenderedHTML(editorContent);
    } else {
      toast.error("Something went wrong while rendering form contents");
    }

    setIsLoading(false);
  };

  return (
    <main>
      <DesktopNavbar />
      <div className="px-4 lg:px-8 py-10">
        {renderedHTML && (
          <div className="space-y-5 mb-10">
            <div className="py-5 px-5 h-fit w-full bg-[#f5f5f5] rounded-md">
              <div
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(renderedHTML),
                }}
              />
            </div>
          </div>
        )}
        <Editor
          apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY}
          onInit={(evt, editor) => (editorRef.current = editor)}
          // initialValue="<p>Start writing...</p>"
          init={{
            height: 500,
            menubar: false,
            // plugins: [
            //     'advlist autolink lists link image charmap print preview anchor',
            //     'searchreplace visualblocks code fullscreen',
            //     'insertdatetime media table paste code help wordcount'
            // ],
            // toolbar: 'image',
            toolbar: [
              "undo redo | styles | fontsize fontfamily | bold italic | alignleft aligncenter alignright blockquote | lineheight underline | bullist numlist | insertfile image media | tableofcontents tablecellprops | link openlink unlink | copy copy paste pastetext print redo math mergetags pageembed revisionhistory searchreplace spellcheckdialog spellchecker | code codesample typopgraphy anchor checklist | forecolor backcolor emoticons wordcount",
            ],
            // plugins: 'image editimage advlist link lists',
            plugins: [
              "advlist",
              "autolink",
              "link",
              "image",
              "lists",
              "charmap",
              "preview",
              "anchor",
              "pagebreak",
              "searchreplace",
              "wordcount",
              "visualblocks",
              "visualchars",
              "code",
              "fullscreen",
              "insertdatetime",
              "media",
              "table",
              "emoticons",
              "help",
            ],
            editimage_toolbar:
              "rotateleft rotateright | flipv fliph | editimage imageoptions",
            toolbar_mode: "wrap",
            content_style:
              "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
          }}
        />
        <div className="flex items-center gap-5 mt-5">
          <button
            onClick={() => {
              setRenderedHTML(null);
            }}
            disabled={!renderedHTML}
            className="w-full h-[50px] flex items-center justify-center bg-white border border-black text-red-700 cursor-pointer flex-1 disabled:border-none disabled:cursor-not-allowed disabled:bg-dark/10 disabled:text-[#A1A1A1]"
          >
            Remove
          </button>
          <button
            onClick={log}
            disabled={isLoading}
            className="w-full h-[50px] flex items-center justify-center bg-dark text-white cursor-pointer flex-1 disabled:cursor-not-allowed disabled:bg-dark/10 disabled:text-[#A1A1A1]"
          >
            {isLoading ? <LoadSmall /> : "Print form"}
          </button>
        </div>
      </div>
    </main>
  );
}
