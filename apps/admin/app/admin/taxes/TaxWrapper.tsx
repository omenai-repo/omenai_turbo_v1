"use client";
import NexusState from "./components/NexusState";
import { nexus_states } from "./nexus_states_list";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { canAccessRoute } from "../../utils/canAccessRoute";
import ForbiddenPage from "../components/ForbiddenPage";

export default function TaxWrapper() {
  const { user } = useAuth({ requiredRole: "admin" });

  // Check permissions
  if (!canAccessRoute(user.access_role, "taxes")) {
    return <ForbiddenPage userRole={user.access_role} />;
  }
  return (
    <div>
      <div className="flex flex-col space-y-3">
        {nexus_states.map((state) => {
          return (
            <NexusState
              key={state.code}
              state={state.state}
              code={state.code}
              flag_url={state.flag_url}
            />
          );
        })}
      </div>
    </div>
  );
}
