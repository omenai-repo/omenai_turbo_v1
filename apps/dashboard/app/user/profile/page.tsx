import UserProfile from "./components/ProfilePage";
import ProfileWrapper from "./components/ProfileWrapper";

export const dynamic = "force-dynamic";
export default async function page() {
  return <ProfileWrapper />;
}
