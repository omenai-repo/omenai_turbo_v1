"use client";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import UserSupportHistory from "@omenai/shared-ui-components/components/support/UserSupportHistory";
export default function PageWrapper() {
  const { user } = useAuth({ requiredRole: "artist" });
  return <UserSupportHistory id={user.id} />;
}
