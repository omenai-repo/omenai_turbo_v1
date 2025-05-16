import LoggedInUserDropDown from "./LoggedInUserDropdown";

export default function LoggedInUser({
  user,
  email,
}: {
  user: string | undefined;
  email: string | undefined;
}) {
  return (
    <div className="flex items-center">
      <LoggedInUserDropDown user={user} email={email} />
    </div>
  );
}
