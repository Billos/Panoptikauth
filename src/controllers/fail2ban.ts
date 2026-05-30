import { Request, Response } from "express"
import z from "zod"

import { getRedisClient } from "../redis"
import { Fail2banBanEntry, Fail2banBanRequest } from "../types/fail2ban"

const REDIS_KEY = "fail2ban:pending"

const Fail2banBanSchema = z.object({
  ip: z.string().min(1),
  jail: z.string().optional(),
})

export async function handleFail2banBan(req: Request<{}, {}, Fail2banBanRequest>, res: Response) {
  const parsed = Fail2banBanSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json(parsed.error)
  }

  const entry: Fail2banBanEntry = {
    ip: parsed.data.ip,
    jail: parsed.data.jail,
    bannedAt: new Date().toISOString(),
  }

  try {
    const redis = getRedisClient()
    await redis.rpush(REDIS_KEY, JSON.stringify(entry))
  } catch (error) {
    console.error("Failed to store fail2ban entry in Redis:", error)
    return res.status(500).json({ error: "Failed to store ban entry" })
  }

  console.log("fail2ban: queued ban for IP %s (jail: %s)", entry.ip, entry.jail || "unknown")
  return res.status(202).json({ status: "queued", ip: entry.ip })
}
