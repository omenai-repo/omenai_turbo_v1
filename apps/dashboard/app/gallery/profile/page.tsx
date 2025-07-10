import PageTitle from "../components/PageTitle";
import GalleryInfo from "./features/GalleryInfo";
export const dynamic = "force-dynamic";
export default async function page() {
  return (
    <div>
      {/* <UserBanner /> */}
      <PageTitle title="Profile Information" />
      <GalleryInfo />
    </div>
  );
}
