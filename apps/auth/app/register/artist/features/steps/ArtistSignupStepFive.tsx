import React from "react";
import ActionButtons from "../actions/ActionButtons";
import ArtStyle from "../preferences/ArtStyle";

export default function ArtistSignupStepFive() {
  return (
    <div className="flex flex-col space-y-6">
      <ArtStyle />
      <ActionButtons />
    </div>
  );
}
