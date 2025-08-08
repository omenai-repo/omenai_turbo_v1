import React, { useRef } from "react";
import { Editor } from "@tinymce/tinymce-react";
import type { Editor as TinyMCEEditor } from "tinymce";
import { Button } from "@mantine/core";
import { EditorialSchemaTypes } from "@omenai/shared-types";

export function EditorialContentEditor({
  handleEditorialUpload,
  loading,
}: {
  handleEditorialUpload: (content: string) => void;
  loading: boolean;
}) {
  const editorRef = useRef<TinyMCEEditor>();
  return (
    <>
      <Editor
        apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY!}
        onInit={(_evt, editor) => (editorRef.current = editor)}
        init={{
          plugins:
            "preview importcss searchreplace autolink autosave save directionality code visualblocks visualchars fullscreen image link media codesample table charmap pagebreak nonbreaking anchor insertdatetime advlist lists wordcount help charmap quickbars emoticons accordion",
          editimage_cors_hosts: ["picsum.photos"],
          menubar: "file edit view insert format tools table help",
          toolbar:
            "undo redo | accordion accordionremove | blocks fontfamily fontsize | bold italic underline strikethrough | align numlist bullist | link image | table media | lineheight outdent indent| forecolor backcolor removeformat | charmap emoticons | code fullscreen preview | save print | pagebreak anchor codesample | ltr rtl",
          autosave_ask_before_unload: true,
          autosave_interval: "30s",
          autosave_prefix: "{path}{query}-{id}-",
          autosave_restore_when_empty: false,
          autosave_retention: "2m",
          image_advtab: true,
          importcss_append: true,
          image_caption: true,
          quickbars_selection_toolbar:
            "bold italic | quicklink h2 h3 blockquote quickimage quicktable",
          noneditable_class: "mceNonEditable",
          toolbar_mode: "sliding",
          contextmenu: "link image table",

          content_style:
            "body { font-family:Helvetica,Arial,sans-serif; font-size:16px }",
        }}
        initialValue="Delete this and start writing your content!"
      />
      <div className="my-6">
        <Button
          loading={loading}
          onClick={() => {
            if (editorRef.current) {
              handleEditorialUpload(editorRef.current.getContent());
            }
          }}
          variant="filled"
          color="#0f172a"
          className="ring-1 ring-dark border-0"
        >
          Save and upload this Editorial
        </Button>
      </div>
    </>
  );
}
