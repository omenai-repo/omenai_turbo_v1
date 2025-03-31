import React from "react";
import ImageUpload from "../form/components/ImageUpload";
import ActionButtons from "../actions/ActionButtons";

export default function ArtistSignupStepfour() {
  return (
    <div className="flex flex-col space-y-6">
      <ImageUpload />
      <ActionButtons />
    </div>
  );
}
