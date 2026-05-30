import { Queue, Worker } from "bullmq"

import { Gotify } from "../gotify"
import { getRedis } from "../redis"

const FAIL2BAN_SET_KEY = "fail2ban:unnotified"
const QUEUE_NAME = "fail2ban-notify"

type Fail2banEntry = {
  ip: string
  jail: string
  timestamp: string
}

export function startFail2banWorker(): void {
  const connection = getRedis()

  const queue = new Queue(QUEUE_NAME, { connection })

  // Add a repeatable job (cron) that runs every 5 minutes
  queue.upsertJobScheduler(
    "fail2ban-cron",
    { pattern: "*/5 * * * *" },
    { name: "fail2ban-batch-notify" },
  )

  console.log("[fail2ban] Cron job scheduled: every 5 minutes")

  const worker = new Worker(
    QUEUE_NAME,
    async () => {
      const redis = getRedis()
      const entries: string[] = await redis.lrange(FAIL2BAN_SET_KEY, 0, -1)

      if (entries.length === 0) {
        console.log("[fail2ban] No unnotified IPs to process")
        return
      }

      // Remove all entries atomically
      await redis.del(FAIL2BAN_SET_KEY)

      const parsed: Fail2banEntry[] = entries.map((e) => JSON.parse(e) as Fail2banEntry)

      const title = `🚫 Fail2ban: ${parsed.length} IP(s) banned`
      const message = parsed
        .map((entry) => `- **${entry.ip}** (jail: ${entry.jail}, at: ${entry.timestamp})`)
        .join("\n")

      const gotifyUrl = process.env.GOTIFY_FAIL2BAN_URL
      const gotifyToken = process.env.GOTIFY_FAIL2BAN_TOKEN

      if (!gotifyUrl || !gotifyToken) {
        console.error("[fail2ban] Missing GOTIFY_FAIL2BAN_URL or GOTIFY_FAIL2BAN_TOKEN environment variables")
        // Re-push entries back so they are not lost
        const pipeline = redis.pipeline()
        for (const entry of entries) {
          pipeline.rpush(FAIL2BAN_SET_KEY, entry)
        }
        await pipeline.exec()
        return
      }

      const gotify = new Gotify({ url: gotifyUrl, token: gotifyToken })
      await gotify.sendMessage(title, message, 7)
      console.log(`[fail2ban] Sent notification for ${parsed.length} banned IP(s)`)
    },
    { connection },
  )

  worker.on("failed", (job, err) => {
    console.error(`[fail2ban] Job ${job?.id} failed:`, err)
  })

  worker.on("completed", (job) => {
    console.log(`[fail2ban] Job ${job.id} completed`)
  })
}
