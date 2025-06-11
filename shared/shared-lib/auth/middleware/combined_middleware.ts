// Purpose: Combine rate limiting with Highlight.io
// ============================================================================

import { withAppRouterHighlight } from "../../highlight/app_router_highlight";
import { withRateLimit } from "./rate_limit_middleware";

interface CombinedConfig {
  limit: number;
  window: number;
  keyPrefix?: string;
  keyGenerator?: (request: Request) => string;
}

/**
 * Combined middleware: Rate Limiting + Highlight.io
 * Rate limiting runs FIRST, then Highlight
 */
export function withRateLimitAndHighlight(config: CombinedConfig) {
  return function combinedWrapper(
    handler: (request: Request) => Promise<Response>
  ) {
    // Apply rate limiting first, then Highlight
    return withAppRouterHighlight(withRateLimit(config)(handler));
  };
}
