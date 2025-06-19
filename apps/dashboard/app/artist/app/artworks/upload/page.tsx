'use client";';
import PageTitle from "../../components/PageTitle";
import UploadArtworkDetails from "./features/UploadArtworkDetails";

export const dynamic = "force-dynamic"; // This page should always be dynamic
export default function UploadArtwork() {
  return (
    <div className="relative">
      <PageTitle title="Upload an artwork" />

      <UploadArtworkDetails />
    </div>
  );
}
