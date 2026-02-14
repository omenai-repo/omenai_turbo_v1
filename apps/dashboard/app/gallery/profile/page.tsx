import PageTitle from "../components/PageTitle";
import { AccountInformationWrapper } from "./features/GalleryInfo";
export const dynamic = "force-dynamic";
export default async function page() {
  return (
    <div>
      {/* <UserBanner /> */}
      <AccountInformationWrapper />
    </div>
  );
}
