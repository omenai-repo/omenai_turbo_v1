import { useContext } from "react";
import { uploadArtistDetailsInputMocks } from "../mocks";
import ArtworkSelectInput from "./ArtworkSelectInput";
import ArtworkTextInput from "./ArtworkTextInput";
import { useSession } from "@omenai/package-provider/SessionProvider";
import { ArtistSchemaTypes } from "@omenai/shared-types";

export default function ArtistInfoInputGroup() {
  const session = useSession();
  return (
    <div className="my-10">
      <h2 className="text-gray-700 font-semibold text-base my-4">
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
                value={
                  input.name === "artist"
                    ? (session as ArtistSchemaTypes).name
                    : ""
                }
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
