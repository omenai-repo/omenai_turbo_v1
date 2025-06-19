import PageTitle from "../../components/PageTitle";
import UploadArtworkDetails from "./features/UploadArtworkDetails";
export default function UploadArtwork() {
  return (
    <div className="relative">
      <PageTitle title="Upload an artwork" />

      <UploadArtworkDetails />
    </div>
  );
}
