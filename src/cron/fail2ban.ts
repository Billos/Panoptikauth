import { schedule } from "node-cron"

import { formatFail2banBans } from "../formatters/fail2ban"
import { Gotify } from "../gotify"
import { getRedisClient } from "../redis"
import { Fail2banBanEntry } from "../types/fail2ban"

const REDIS_KEY = "fail2ban:pending"
const REDIS_PROCESSING_KEY = "fail2ban:processing"

const CRON_SCHEDULE = process.env.FAIL2BAN_CRON || "*/5 * * * *"
const GOTIFY_URL = process.env.GOTIFY_URL || ""
const GOTIFY_TOKEN = process.env.GOTIFY_TOKEN || ""

async function drainPendingBans(): Promise<Fail2banBanEntry[]> {
  const redis = getRedisClient()

  // Atomically rename the pending list so no entries are lost during processing
  const exists = await redis.exists(REDIS_KEY)
  if (!exists) {
    return []
  }

  await redis.rename(REDIS_KEY, REDIS_PROCESSING_KEY)

  const raw = await redis.lrange(REDIS_PROCESSING_KEY, 0, -1)
  await redis.del(REDIS_PROCESSING_KEY)

  return raw.map((item) => JSON.parse(item) as Fail2banBanEntry)
}

export function startFail2banCron(): void {
  if (!GOTIFY_URL || !GOTIFY_TOKEN) {
    console.warn("fail2ban cron: GOTIFY_URL or GOTIFY_TOKEN not set, cron will not send notifications")
  }

  console.log("fail2ban cron: starting with schedule '%s'", CRON_SCHEDULE)

  schedule(CRON_SCHEDULE, async () => {
    let entries: Fail2banBanEntry[]
    try {
      entries = await drainPendingBans()
    } catch (error) {
      console.error("fail2ban cron: failed to read from Redis:", error)
      return
    }

    if (entries.length === 0) {
      return
    }

    console.log("fail2ban cron: sending notification for %d banned IP(s)", entries.length)

    try {
      const gotify = new Gotify({ url: GOTIFY_URL, token: GOTIFY_TOKEN })
      const { title, message, priority } = formatFail2banBans(entries)
      await gotify.sendMessage(title, message, priority ?? 5)
    } catch (error) {
      console.error("fail2ban cron: failed to send Gotify notification:", error)
    }
  })
}
