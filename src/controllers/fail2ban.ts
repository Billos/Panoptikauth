import { Request, Response } from "express"

import { getRedis } from "../redis"
import { Fail2banPayload } from "../types/fail2ban"

const FAIL2BAN_SET_KEY = "fail2ban:unnotified"

type Fail2banRequest = {
  ip: string
  jail?: string
  timestamp?: string
}

export async function handleFail2banRequest(req: Request<{}, {}, Fail2banRequest>, res: Response) {
  const { ip, jail, timestamp } = req.body

  if (!ip) {
    return res.status(400).json({ error: "Missing required field: ip" })
  }

  try {
    const redis = getRedis()
    const entry: Fail2banPayload = { ip, jail: jail || "unknown", timestamp: timestamp || new Date().toISOString() }
    await redis.rpush(FAIL2BAN_SET_KEY, JSON.stringify(entry))
    console.log(`[fail2ban] Stored banned IP: ${ip} (jail: ${entry.jail})`)
    return res.status(200).json({ status: "ok", service: "panoptikauth", message: "IP stored for notification" })
  } catch (error) {
    console.error("[fail2ban] Failed to store banned IP:", error)
    return res.status(500).json({ error: "Failed to store banned IP" })
  }
}
