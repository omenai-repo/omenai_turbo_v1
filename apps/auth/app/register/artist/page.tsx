import ArtistSignupPageWrapper from "./ArtistSignupPageWrapper";

export default async function ArtistSignupPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<{ [key: string]: string | undefined }>;
}>) {
  const referrerKey = (await searchParams).referrerKey;
  const email = (await searchParams).email;
  const inviteCode = (await searchParams).inviteCode;
  return (
    <ArtistSignupPageWrapper
      referrerKey={referrerKey}
      email={email}
      inviteCode={inviteCode}
    />
  );
}
