// app/page.tsx (Server Component)
import { decryptLinkData } from "@omenai/shared-utils/src/deeplinkCrypto";
import { redirect } from "next/navigation";
import FallbackActions from "./FallbackActions";

export default async function FallbackPage({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  const token = searchParams.token;

  // 1. Handle missing tokens immediately
  if (!token) {
    redirect("https://omenai.app");
  }

  // 2. Decrypt the payload securely on the server
  const decryptedData = decryptLinkData(token);

  // 3. Handle tampered or invalid tokens
  if (!decryptedData) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FAFAFA]">
        <div className="text-center">
          <h1 className="text-xl font-medium text-zinc-900">Link Expired</h1>
          <p className="mt-2 text-sm text-zinc-500">
            This secure link is invalid or has been modified.
          </p>
        </div>
      </main>
    );
  }

  // 4. Render the premium, minimalist fallback UI
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#FAFAFA] p-6">
      <div className="w-full max-w-sm space-y-8 rounded-xl bg-white p-8 shadow-sm border border-zinc-100">
        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
            Continue to Omenai
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Securely complete your action in the app or on the web.
          </p>
        </div>

        {/* Pass the decrypted data and the raw token to the client interactive buttons */}
        <FallbackActions data={decryptedData} rawToken={token} />
      </div>
    </main>
  );
}
