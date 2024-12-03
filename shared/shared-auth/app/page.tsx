import { createSession, getSession } from "../lib/auth/session";
import Test from "./Test";

export default function Page() {
  const handleClick = async () => {
    "use server";
    const response = await fetch("http://localhost:8080/api/auth/session");
    const res = await response.json();
    console.log(res);
  };

  return (
    <h1>
      <Test handleClick={handleClick} />
    </h1>
  );
}
