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

  // Check permissions
  if (!canAccessRoute(user.access_role, "editorials")) {
    return <ForbiddenPage userRole={user.access_role} />;
  }
  return (
    <div className="flex flex-col space-y-10">
      <div className="flex justify-between items-center">
        <h1 className="text-fluid-lg font-semibold">Your Editorials</h1>
        <Link href={"/admin/editorials/add"}>
          <Button
            variant="filled"
            color="#1a1a1a"
            className="ring-1 ring-dark border-0"
          >
            Add an editorial piece
          </Button>
        </Link>
      </div>
      <Editorials />
    </div>
  );
}
