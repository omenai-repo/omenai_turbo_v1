import React from "react";
import PageTitle from "../../components/PageTitle";
import QuoteForm from "./components/QuoteForm";

export default function page() {
  return (
    <div>
      <PageTitle title={"Orders"} />
      <QuoteForm />
    </div>
  );
}
