import { ConnectionOptions } from "bullmq"
import IORedis from "ioredis"

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379"

let redis: IORedis | null = null

export function getRedis(): IORedis {
  if (!redis) {
    console.log("Initializing Redis client")
    redis = new IORedis(REDIS_URL, { maxRetriesPerRequest: null })
  }
  return redis
}

export function getBullMQRedis(): ConnectionOptions {
  return {
    url: REDIS_URL,
  }
}
