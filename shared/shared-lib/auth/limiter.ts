import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export const limiter = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "3600s"),
});

export const requestGalleryVerif = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, "86400s"),
});
