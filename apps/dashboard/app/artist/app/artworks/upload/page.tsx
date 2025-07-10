import PageTitle from "../../components/PageTitle";
import UploadArtworkDetails from "./features/UploadArtworkDetails";
export const dynamic = "force-dynamic";
export default function page() {
  return (
    <div className="relative">
      <PageTitle title="Upload an artwork" />

      <UploadArtworkDetails />
    </div>
  );
}
