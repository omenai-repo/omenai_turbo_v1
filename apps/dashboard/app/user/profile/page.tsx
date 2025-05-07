import { UserBanner } from "./features/UserBanner";
import GalleryInfo from "./features/UserInfo";

export default async function page() {
  return (
    <div className="">
      <UserBanner />

      <GalleryInfo />
    </div>
  );
}
