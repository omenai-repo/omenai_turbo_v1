import { Redis } from "@upstash/redis";

// Initialize Redis client with Upstash credentials
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!, // REST API endpoint
  token: process.env.UPSTASH_REDIS_REST_TOKEN!, // Authentication token
});

export default redis;
