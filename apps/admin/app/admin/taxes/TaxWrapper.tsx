"use client";
import { nexus_states } from "./nexus_states_list";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { canAccessRoute } from "../../utils/canAccessRoute";
import ForbiddenPage from "../components/ForbiddenPage";
import { NexusState } from "./components/NexusState";

export default function TaxWrapper() {
  const { user } = useAuth({ requiredRole: "admin" });

  // Check permissions
  if (!canAccessRoute(user.access_role, "taxes")) {
    return <ForbiddenPage userRole={user.access_role} />;
  }
  return (
    <div className="my-5 flex flex-col space-y-5 py-4">
      <h4 className="text-fluid-xl font-bold">Nexus states in the USA</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {nexus_states.map((state) => (
          <NexusState
            key={state.code}
            state={state.state}
            code={state.code}
            flag_url={state.flag_url}
          />
        ))}
      </div>
    </div>
  );
}
