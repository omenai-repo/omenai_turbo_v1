import LoggedInUserDropDown from "./LoggedInUserDropdown";

export default function LoggedInUser({ user }: { user: string | undefined }) {
  return (
    <div className="flex items-center">
      <LoggedInUserDropDown user={user} />
    </div>
  );
}
