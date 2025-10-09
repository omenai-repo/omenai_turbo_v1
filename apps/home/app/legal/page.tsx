import React, { Suspense } from "react";
import LegalDocuments from "./LegalWrapper";

export default function page() {
  return (
    <Suspense>
      <LegalDocuments />
    </Suspense>
  );
}
