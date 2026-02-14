"use client";

import { Button } from "@mantine/core";
import React from "react";
import Editorials from "./components/Editorials";
import Link from "next/link";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { canAccessRoute } from "../../utils/canAccessRoute";
import ForbiddenPage from "../components/ForbiddenPage";

export default function EditorialWrapper() {
  const { user } = useAuth({ requiredRole: "admin" });

  if (!canAccessRoute(user.access_role, "editorials")) {
    return <ForbiddenPage userRole={user.access_role} />;
  }

  return (
    <section className="space-y-6">
      {/* Page header */}
      <header className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-lg font-semibold text-neutral-900">Editorials</h1>
          <p className="text-sm text-neutral-500">
            Manage long-form editorial content published on the platform
          </p>
        </div>

        <Link href="/admin/editorials/add">
          <Button
            size="sm"
            radius="md"
            className="
              bg-neutral-900 text-white
              hover:bg-neutral-800
              transition
            "
          >
            Add editorial
          </Button>
        </Link>
      </header>

      {/* Content surface */}
      <div className="rounded border border-neutral-200 bg-white shadow-sm">
        <div className="p-4">
          <Editorials />
        </div>
      </div>
    </section>
  );
}
