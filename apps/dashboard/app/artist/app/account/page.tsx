import { Library, Settings, UserRoundPen } from "lucide-react";
import PageTitle from "../components/PageTitle";
import ArtistInfo from "./features/ArtistInfo";
import { Tabs } from "@mantine/core";
import SettingsActions from "../settings/SettingsActions";
export const dynamic = "force-dynamic"; // This page should always be dynamic
export default function AccountPage() {
  return (
    <div className="space-y-5">
      {/* <UserBanner /> */}
      <PageTitle title="Profile Information" />
      <p>Coming soon</p>
      {/* <Tabs
        color="#0f172a"
        variant="outline"
        radius="md"
        defaultValue="account"
      >
        <Tabs.List>
          <Tabs.Tab
            value="account"
            leftSection={
              <UserRoundPen size={16} absoluteStrokeWidth strokeWidth={1.5} />
            }
          >
            Account Information
          </Tabs.Tab>
          <Tabs.Tab
            value="credentials"
            leftSection={
              <Library size={16} absoluteStrokeWidth strokeWidth={1.5} />
            }
          >
            Credentials
          </Tabs.Tab>
          <Tabs.Tab
            value="settings"
            leftSection={
              <Settings size={16} strokeWidth={1} absoluteStrokeWidth />
            }
          >
            Settings
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="account">
          <ArtistInfo />
        </Tabs.Panel>

        <Tabs.Panel value="credentials">Messages tab content</Tabs.Panel>

        <Tabs.Panel value="settings">
          <SettingsActions />
        </Tabs.Panel>
      </Tabs> */}
    </div>
  );
}
