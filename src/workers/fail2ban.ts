import { Queue, Worker } from "bullmq"

import { Gotify } from "../gotify"
import { getRedis } from "../redis"
import { Fail2banPayload } from "../types/fail2ban"

const FAIL2BAN_SET_KEY = "fail2ban:unnotified"
const QUEUE_NAME = "fail2ban-notify"

// Lua script to atomically pop all entries from the list
const ATOMIC_POP_ALL = `
local entries = redis.call('lrange', KEYS[1], 0, -1)
if #entries > 0 then
  redis.call('del', KEYS[1])
end
return entries
`

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

      // Atomically fetch and delete all entries using Lua script
      const entries = (await redis.eval(ATOMIC_POP_ALL, 1, FAIL2BAN_SET_KEY)) as string[]

      if (!entries || entries.length === 0) {
        console.log("[fail2ban] No unnotified IPs to process")
        return
      }

      const parsed: Required<Fail2banPayload>[] = entries.map((e) => JSON.parse(e) as Required<Fail2banPayload>)

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
