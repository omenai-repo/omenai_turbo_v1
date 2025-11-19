"use client";

import { useEffect } from "react";
import Rollbar from "rollbar";
import { clientConfig } from "@omenai/rollbar-config";
import ErrorComponent from "@omenai/shared-ui-components/components/error/Error";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    const rollbar = new Rollbar(clientConfig);

    rollbar.error(error);
  }, [error]);

  return (
    <html>
      <body>
        <ErrorComponent reset={reset} error={error} />;
      </body>
    </html>
  );
}
