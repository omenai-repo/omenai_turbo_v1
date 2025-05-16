import { UserBanner } from "./features/UserBanner";
import GalleryInfo from "./features/UserInfo";

export default async function page() {
  return (
    <div className="max-w-screen-lg mx-auto space-y-4 ">
      <UserBanner />

      <div className="grid place-items-center">
        <GalleryInfo />
      </div>
    </div>
  );
}
