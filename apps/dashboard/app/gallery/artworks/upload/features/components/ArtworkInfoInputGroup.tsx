import { uploadArtworkDetailInputMocks } from "../mocks";
import ArtworkSelectInput from "./ArtworkSelectInput";
import ArtworkTextInput from "./ArtworkTextInput";
import { Ruler } from "lucide-react";
export default function ArtworkInfoInputGroup() {
  return (
    <div className="my-10 w-full">
      {/* Header Section */}

      <div className="flex flex-col gap-2 mb-4">
        <h2 className="text-dark font-medium text-md">Artwork Details</h2>
        <p className="text-slate-500 text-sm">
          Provide the core identifiers and physical attributes of the piece.
        </p>
      </div>
      {/* Main Card Container */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {uploadArtworkDetailInputMocks.map((input, index) => {
            // Dynamic span: Description/Textareas should take up the full width
            const isFullWidth = input.type === "textarea";
            const colSpanClass = isFullWidth
              ? "col-span-1 md:col-span-2 lg:col-span-3"
              : "col-span-1";

            return (
              <div key={input.name} className={colSpanClass}>
                {input.type === "text" || input.type === "textarea" ? (
                  <ArtworkTextInput
                    label={input.label}
                    placeholder={input.placeholder}
                    name={input.name}
                    required={input.required}
                    type={input.type}
                  />
                ) : (
                  <ArtworkSelectInput
                    label={input.label}
                    items={input.options}
                    name={input.name}
                    required={input.required}
                    disabled={false}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
