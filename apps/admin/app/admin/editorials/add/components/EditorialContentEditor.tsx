import React, { useRef, useState } from "react";
import { Editor } from "@tinymce/tinymce-react";
import type { Editor as TinyMCEEditor } from "tinymce";
import { Button } from "@mantine/core";
import { ID } from "appwrite";
import imageCompression from "browser-image-compression";
import { storage } from "@omenai/appwrite-config";
// import { storage } from "@/lib/appwrite"; // Adjust this import to match your Appwrite setup

export function EditorialContentEditor({
  handleEditorialUpload,
  loading,
}: {
  handleEditorialUpload: (content: string) => void;
  loading: boolean;
}) {
  const editorRef = useRef<TinyMCEEditor | null>(null);

  // Local state to indicate when TinyMCE is actively compressing and uploading the batch
  const [isProcessingImages, setIsProcessingImages] = useState(false);

  const handleSave = async () => {
    if (!editorRef.current) return;

    setIsProcessingImages(true);

    try {
      // 1. Triggers the images_upload_handler for every local blob currently in the editor
      await editorRef.current.uploadImages();

      // 2. Grab the final HTML (now populated with live Appwrite WebP URLs)
      const finalHtml = editorRef.current.getContent();

      // 3. Push the clean, optimized HTML string to your TablesDB
      handleEditorialUpload(finalHtml);
    } catch (error) {
      console.error("Failed to process images before saving:", error);
    } finally {
      setIsProcessingImages(false);
    }
  };

  return (
    <div className="w-full">
      <Editor
        apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY!}
        onInit={(_evt, editor) => (editorRef.current = editor)}
        init={{
          height: 600,
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
          branding: false,
          elementpath: false,

          // Allow drag-and-drop of local files
          paste_data_images: true,

          automatic_uploads: false,

          images_upload_handler: async (blobInfo, progress) => {
            try {
              const blob = blobInfo.blob();
              const filename = blobInfo.filename();
              progress(1);

              // 1. Reconstruct the original massive file
              const originalFile = new File([blob], filename, {
                type: blob.type,
              });

              // 2. Aggressively compress it before Appwrite ever sees it
              // (e.g., forces a 15MB TIFF down to a sub-1MB JPEG)
              const options = {
                maxSizeMB: 1,
                maxWidthOrHeight: 1920, // Perfect max width for high-res web viewing
                useWebWorker: true,
              };
              const compressedBlob = await imageCompression(
                originalFile,
                options,
              );
              const compressedFile = new File([compressedBlob], filename, {
                type: compressedBlob.type,
              });

              const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
              const projectId = process.env.NEXT_PUBLIC_APPWRITE_CLIENT_ID!;
              const bucketId =
                process.env.NEXT_PUBLIC_APPWRITE_EDITORIAL_BUCKET_ID!;

              // 3. Upload the lightweight file using your object-based signature
              const uploadedFile = await storage.createFile({
                bucketId,
                fileId: ID.unique(),
                file: compressedFile,
                onProgress: (uploadProgress: any) => {
                  progress(Math.round(uploadProgress.progress));
                },
              });

              // 4. Construct the URL using /preview to force WebP conversion and 80% quality delivery
              const imageUrl = `${endpoint}/storage/buckets/${bucketId}/files/${uploadedFile.$id}/preview?project=${projectId}&output=webp&quality=80`;

              progress(100);
              return imageUrl;
            } catch (error) {
              console.error(
                "Failed to upload compressed image to Appwrite:",
                error,
              );
              throw new Error("Image upload failed");
            }
          },
        }}
        initialValue="Start writing your editorial here…"
      />
      <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-8 pointer-events-none">
        <div className="bg-white/80 backdrop-blur-md shadow-lg border border-neutral-200 rounded-full px-6 py-4 pointer-events-auto transition-transform hover:scale-[1.02]">
          <Button
            loading={loading || isProcessingImages}
            onClick={handleSave}
            variant="filled"
            color="#0f172a"
            radius="xl"
            className="font-medium px-8"
          >
            {isProcessingImages
              ? "Optimizing Media images..."
              : "Publish Editorial"}
          </Button>
        </div>
      </div>
    </div>
  );
}
