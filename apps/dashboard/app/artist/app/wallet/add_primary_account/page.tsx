import PageTitle from "../../components/PageTitle";
import AccountForm from "./components/AccountForm";
import { Paper } from "@mantine/core";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function page() {
  return (
    <div>
      <PageTitle title="Add primary account" />
      <div className="w-full py-8">
        <Paper
          radius={"sm"}
          withBorder
          className="max-w-full w-full p-8 flex flex-col space-y-6"
        >
          <div>
            <h5 className="font-semibold">Add a primary bank account</h5>
            <span className="text-fluid-xxs">
              Fill in the details below to add a primary bank account for
              withdrawals
            </span>
          </div>
          <AccountForm />
        </Paper>
      </div>
    </div>
  );
}
