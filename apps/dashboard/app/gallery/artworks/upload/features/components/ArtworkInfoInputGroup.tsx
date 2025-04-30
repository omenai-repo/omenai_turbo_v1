import { uploadArtworkDetailInputMocks } from "../mocks";
import ArtworkSelectInput from "./ArtworkSelectInput";
import ArtworkTextInput from "./ArtworkTextInput";

export default function ArtworkInfoInputGroup() {
  return (
    <div className="my-10">
      <h2 className="text-dark font-normal text-fluid-base my-4">
        Artwork details
      </h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 ">
        {uploadArtworkDetailInputMocks.map((input, index) => {
          if (input.type === "text" || input.type === "textarea") {
            return (
              <ArtworkTextInput
                key={input.name}
                label={input.label}
                placeholder={input.placeholder}
                name={input.name}
                required={input.required}
                type={input.type}
              />
            );
          } else {
            return (
              <ArtworkSelectInput
                key={input.name}
                label={input.label}
                items={input.options}
                name={input.name}
                required={input.required}
              />
            );
          }
        })}
      </div>
    </div>
  );
}
