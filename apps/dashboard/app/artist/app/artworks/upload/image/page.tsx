import PageTitle from "../../../components/PageTitle";
import UploadArtworkImage from "../features/UploadArtworkImage";
export const dynamic = "force-dynamic";

export default function page() {
  return (
    <div>
      <h1 className="font-semibold text-lg">Upload Artwork Image</h1>
      <div className="my-4">
        <UploadArtworkImage />
      </div>
    </div>
  );
}
