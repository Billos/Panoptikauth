import IORedis from "ioredis"

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379"

let redis: IORedis | null = null

export function getRedis(): IORedis {
  if (!redis) {
    redis = new IORedis(REDIS_URL, { maxRetriesPerRequest: null })
  }
  return redis
}
