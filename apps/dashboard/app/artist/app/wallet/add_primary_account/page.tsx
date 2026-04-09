import PageTitle from "../../components/PageTitle";
import AccountForm from "./components/AccountForm";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function page() {
  return (
    <div className="w-full h-full">
      <AccountForm />
    </div>
  );
}
