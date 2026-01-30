import { useEffect, useState } from "react";
import { getApiUrl } from "@omenai/url-config/src/config";
import { actionStore } from "@omenai/shared-state-store/src/actions/ActionStore";

export function useTourState(id: string) {
  const hydrate = actionStore((s) => s.hydrate);
  const isCompleted = actionStore((s) => s.isCompleted);
  const markCompleted = actionStore((s) => s.markCompleted);
  const [fetchComplete, setFetchComplete] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const fetchTourRedis = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${getApiUrl()}/api/tour`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const result = await response.json();

        if (response.ok) {
          hydrate(result.completedTours || []);
          setFetchComplete(true);
        } else throw new Error("Failed to fetch tours");
      } catch (error) {
        setError((error as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchTourRedis();
  }, [hydrate, id]);
  return { isCompleted, markCompleted, loading, error, fetchComplete };
}
