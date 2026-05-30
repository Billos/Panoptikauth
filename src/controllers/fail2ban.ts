import { Request, Response } from "express"

import { getRedis } from "../redis"
import { Fail2banPayload } from "../types/fail2ban"

const FAIL2BAN_SET_KEY = "fail2ban:unnotified"

export async function handleFail2banRequest(req: Request<{}, {}, Fail2banPayload>, res: Response) {
  const { ip, jail, timestamp } = req.body

  if (!ip) {
    return res.status(400).json({ error: "Missing required field: ip" })
  }

  try {
    const redis = getRedis()
    const entry = JSON.stringify({ ip, jail: jail || "unknown", timestamp: timestamp || new Date().toISOString() })
    await redis.rpush(FAIL2BAN_SET_KEY, entry)
    console.log(`[fail2ban] Stored banned IP: ${ip} (jail: ${jail || "unknown"})`)
    return res.status(200).json({ status: "ok", service: "panoptikauth", message: "IP stored for notification" })
  } catch (error) {
    console.error("[fail2ban] Failed to store banned IP:", error)
    return res.status(500).json({ error: "Failed to store banned IP" })
  }
}
