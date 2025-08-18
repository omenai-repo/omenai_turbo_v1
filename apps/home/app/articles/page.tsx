import DesktopNavbar from "@omenai/shared-ui-components/components/navbar/desktop/DesktopNavbar";
import React from "react";
import ArticleWrapper from "./ArticleWrapper";
export const dynamic = "force-dynamic";
export default function page() {
  return (
    <div>
      <DesktopNavbar />
      <ArticleWrapper />
    </div>
  );
}
