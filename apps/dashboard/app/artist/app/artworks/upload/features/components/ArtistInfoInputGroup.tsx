import { uploadArtistDetailsInputMocks } from "../mocks";
import ArtworkSelectInput from "./ArtworkSelectInput";
import ArtworkTextInput from "./ArtworkTextInput";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";

export default async function ArtistInfoInputGroup() {
  const { user } = useAuth({ requiredRole: "artist" });
  return (
    <div className="my-10">
      <h2 className="text-dark font-semibold text-fluid-base my-4">
        Artist information
      </h2>
      <div className="grid grid-cols-3 gap-5 ">
        {uploadArtistDetailsInputMocks.map((input, index) => {
          if (input.type === "text") {
            return (
              <ArtworkTextInput
                key={input.name}
                label={input.label}
                placeholder={input.placeholder}
                name={input.name}
                required={input.required}
                disabled={input.name === "artist"}
                value={input.name === "artist" ? user.name : ""}
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
