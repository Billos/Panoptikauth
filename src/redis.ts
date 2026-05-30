import Redis from "ioredis"

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379"

let client: Redis | null = null

export function getRedisClient(): Redis {
  if (!client) {
    client = new Redis(REDIS_URL)
    client.on("error", (err) => console.error("Redis error:", err))
    client.on("connect", () => console.log("Redis connected"))
  }
  return client
}
