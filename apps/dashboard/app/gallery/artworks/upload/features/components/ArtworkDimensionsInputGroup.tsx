import { uploadArtworkDimensionInputMocks } from "../mocks";
import ArtworkTextInput from "./ArtworkTextInput";
import { Ruler } from "lucide-react";

export default function ArtworkDimensionsInputGroup() {
  return (
    <div className="my-10 w-full">
      {/* Header Section */}

      <div className="flex flex-col gap-1 mb-4">
        <h2 className="text-dark font-medium text-md">Artwork Dimensions</h2>
        <p className="text-slate-500 text-sm">
          Enter the measurements of the piece. Please ensure accuracy for
          shipping and framing purposes.
        </p>
      </div>

      {/* Main Card Container */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {uploadArtworkDimensionInputMocks.map((input, index) => {
            return (
              <div key={input.name} className="relative group">
                <ArtworkTextInput
                  label={input.label}
                  placeholder={input.placeholder}
                  name={input.name}
                  required={input.required}
                />

                {/* Visual styling: Add a subtle connecting line on desktop between inputs, 
                    except for the last one, to imply "X by Y by Z" */}
                {index < uploadArtworkDimensionInputMocks.length - 1 && (
                  <div className="hidden md:block absolute -right-3 top-1/4 translate-x-1/2 pt-4 text-slate-400 pointer-events-none select-none">
                    ×
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
