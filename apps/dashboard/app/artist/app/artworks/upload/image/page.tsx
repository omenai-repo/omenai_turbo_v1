import PageTitle from "../../../components/PageTitle";
import UploadArtworkImage from "../features/UploadArtworkImage";
export const dynamic = "force-dynamic";

export default function page() {
  return (
    <div className="p-5">
      <PageTitle title="Upload artwork Image" />
      <div className="my-12">
        <UploadArtworkImage />
      </div>
    </div>
  );
}
