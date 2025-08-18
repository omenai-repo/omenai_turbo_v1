import { UserBanner } from "./features/UserBanner";
import UserInfo from "./features/UserInfo";
export const dynamic = "force-dynamic";
export default async function page() {
  return (
    <div className="max-w-screen-lg mx-auto space-y-4 ">
      <UserBanner />

      <div className="grid place-items-center">
        <UserInfo />
      </div>
    </div>
  );
}
