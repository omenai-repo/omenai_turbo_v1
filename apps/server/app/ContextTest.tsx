"use client";
import React, { useContext } from "react";
import { SessionContext } from "@omenai/package-provider/SessionProvider";

export default function ContextTest() {
  const { session } = useContext(SessionContext);
  return <div>ContextTest</div>;
}
