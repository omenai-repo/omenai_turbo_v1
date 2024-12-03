import Load from "@omenai/shared-ui-components/components/loader/Load";
import React from "react";

export default function loading() {
  return (
    <div className="h-screen grid place-items-center">
      <Load />
    </div>
  );
}
