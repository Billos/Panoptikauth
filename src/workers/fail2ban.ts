import { Queue, Worker } from "bullmq"

import { getRedis } from "../controllers/redis"
import { FAIL2BAN_SET_KEY } from "../fail2ban"
import { Gotify } from "../gotify"
import { Fail2BanBody } from "../middleware/fail2banParameters"

const QUEUE_NAME = "fail2ban-notify"

export function startFail2banWorker(): void {
  const connection = getRedis()
  const queue = new Queue(QUEUE_NAME, { connection })

  const pattern = process.env.FAIL2BAN_WORKER_CRON || "*/5 * * * *"
  queue.upsertJobScheduler("fail2ban-cron", { pattern }, { name: "fail2ban-batch-notify" })

  console.log(`[fail2ban] Cron job scheduled: ${pattern}`)

  const worker = new Worker(
    QUEUE_NAME,
    async () => {
      const redis = getRedis()
      const entries: string[] = await redis.lrange(FAIL2BAN_SET_KEY, 0, -1)

      if (entries.length === 0) {
        console.log("[fail2ban] No unnotified IPs to process")
        return
      }

      const parsed: Fail2BanBody[] = entries.map((e) => JSON.parse(e) as Fail2BanBody)

      const title = `🚫 Fail2ban: ${parsed.length} IP(s) banned`
      const message = parsed
        .map(
          (entry) =>
            `- **${entry.ip}** banned ${entry.time} (jail: ${entry.jail}, timestamp: ${entry.timestamp}, failures: ${entry.failures})`,
        )
        .join("\n")

      const gotifyUrl = process.env.GOTIFY_URL
      const gotifyToken = process.env.GOTIFY_FAIL2BAN_APP_TOKEN

      if (!gotifyUrl || !gotifyToken) {
        console.error("[fail2ban] Missing GOTIFY_URL or GOTIFY_FAIL2BAN_APP_TOKEN environment variables")
        return
      }

      const gotify = new Gotify({ url: gotifyUrl, token: gotifyToken })
      await gotify.sendMessage(title, message, 7)
      console.log(`[fail2ban] Sent notification for ${parsed.length} banned IP(s)`)

      await redis.del(FAIL2BAN_SET_KEY)
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
