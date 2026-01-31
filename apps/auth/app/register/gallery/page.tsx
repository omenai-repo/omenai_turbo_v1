import { redirect } from "next/navigation";
import GallerySignupPageWrapper from "./GallerySignupPageWrapper";

export default async function GallerySignup({
  searchParams,
}: Readonly<{
  searchParams: Promise<{ [key: string]: string | undefined }>;
}>) {
  const referrerKey = (await searchParams).referrerKey;
  const email = (await searchParams).email;
  const inviteCode = (await searchParams).inviteCode;
  // if (!referrerKey || !email || !inviteCode) redirect("/register");
  return (
    <GallerySignupPageWrapper referrerKey={""} email={""} inviteCode={""} />
  );
}
