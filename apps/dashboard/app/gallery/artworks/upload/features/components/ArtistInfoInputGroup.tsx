import { uploadArtistDetailsInputMocks } from "../mocks";
import ArtworkSelectInput from "./ArtworkSelectInput";
import ArtworkTextInput from "./ArtworkTextInput";

export default function ArtistInfoInputGroup() {
  return (
    <div className="my-10 w-full">
      {/* Header Section */}
      <div className="flex flex-col gap-2 mb-4">
        <h2 className="text-dark font-medium text-md">Artist Information</h2>
        <p className="text-slate-500 text-sm">
          Identify the creator of this artwork.
        </p>
      </div>

      {/* Main Card Container */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {uploadArtistDetailsInputMocks.map((input, index) => {
            return (
              <div key={input.name} className="col-span-1">
                {input.type === "text" ? (
                  <ArtworkTextInput
                    label={input.label}
                    placeholder={input.placeholder}
                    name={input.name}
                    required={input.required}
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
