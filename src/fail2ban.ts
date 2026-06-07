import { Request, Response } from "express"

import { getRedis } from "./controllers/redis"
import { Fail2BanBody } from "./middleware/fail2banParameters"

export const FAIL2BAN_SET_KEY = "fail2ban:unnotified"

export async function handleFail2BanRequest(req: Request<{}, {}, Fail2BanBody>, res: Response) {
  console.log("Handling Fail2Ban request")
  const { ip, time, jail, timestamp, failures } = req.body

  console.log(`Received Fail2Ban notification for IP ${ip} at time ${time}, jail: ${jail}, timestamp: ${timestamp}, failures: ${failures}`)

  if (!ip) {
    return res.status(400).json({ error: "Missing required field: ip" })
  }
  if (!timestamp) {
    req.body.timestamp = new Date().toISOString()
  }

  try {
    const redis = getRedis()
    const entry = JSON.stringify(req.body)
    await redis.rpush(FAIL2BAN_SET_KEY, entry)
    console.log(`[fail2ban] Stored banned IP: ${ip} (time: ${time})`)
    return res.status(200).json({ status: "ok", service: "panoptikauth", message: "IP stored for notification" })
  } catch (error) {
    console.error("[fail2ban] Failed to store banned IP:", error)
    return res.status(500).json({ error: "Failed to store banned IP" })
  }
}
