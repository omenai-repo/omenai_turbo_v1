import PageTitle from "../components/PageTitle";
import SettingsActions from "./SettingsActions";
export const dynamic = "force-dynamic";
export default function Settings() {
  return (
    <div className="px-5 lg:px-2 space-y-5 ">
      <PageTitle title="Settings" />

      <SettingsActions />
    </div>
  );
}
