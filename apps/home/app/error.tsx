"use client";

import { useRollbar } from "@rollbar/react";
import { useEffect } from "react";
import ErrorComponent from "@omenai/shared-ui-components/components/error/Error";
export default function MainError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const rollbar = useRollbar();
  useEffect(() => {
    rollbar.error(error);
  }, [error, rollbar]);
  return (
    <>
      <ErrorComponent error={error} reset={reset} />
    </>
  );
}
