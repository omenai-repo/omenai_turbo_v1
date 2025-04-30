import { uploadArtworkDimensionInputMocks } from "../mocks";
import ArtworkTextInput from "./ArtworkTextInput";

export default function ArtworkDimensionsInputGroup() {
  return (
    <div className="my-10">
      <h2 className="text-dark font-normal text-fluid-base my-4">
        Artwork Dimensions
      </h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 ">
        {uploadArtworkDimensionInputMocks.map((input, index) => {
          return (
            <ArtworkTextInput
              key={input.name}
              label={input.label}
              placeholder={input.placeholder}
              name={input.name}
              required={input.required}
            />
          );
        })}
      </div>
    </div>
  );
}
