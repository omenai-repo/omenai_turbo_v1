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
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-fluid-md font-semibold text-slate-900">
          Nexus states
        </h1>
        <p className="text-sm text-slate-600 max-w-2xl">
          States where Omenai is monitoring sales activity to determine tax
          nexus thresholds and compliance obligations.
        </p>
      </div>

      {/* Grid container */}
      <div
        className="
          grid
          grid-cols-1
          sm:grid-cols-2
          lg:grid-cols-3
          2xl:grid-cols-4
          gap-6
        "
      >
        {nexus_states.map((state) => (
          <NexusState
            key={state.code}
            state={state.state}
            code={state.code}
            flag_url={state.flag_url}
          />
        ))}
      </div>
    </section>
  );
}
