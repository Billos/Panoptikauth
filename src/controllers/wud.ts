import { NextFunction, Request, Response } from "express"

import { formatWudUpdateEvent } from "../formatters/wud"
import { GotifyQuery } from "../middleware/gotifyParameters"
import { FormattedEvent } from "../types/gotify"
import { WudContainer, WudWebhookPayload } from "../types/wud"

export async function handleWudWebhook(
  req: Request<{}, {}, WudWebhookPayload, GotifyQuery>,
  res: Response<{}, { data: FormattedEvent; wudContainer: WudContainer }>,
  next: NextFunction,
) {
  let payload: WudWebhookPayload
  try {
    payload = typeof req.body === "string" ? JSON.parse(req.body) : req.body
  } catch (parseError) {
    console.error("Failed to parse WUD notification:", parseError)
    return res.status(400).json({ error: "Invalid JSON payload" })
  }

  if (!payload.id || !payload.name || !payload.image) {
    return res.status(400).json({ error: "Missing required WUD fields: id, name, or image" })
  }

  if (!payload.updateAvailable) {
    return res.status(200).json({ status: "ok", message: "No update available, skipping notification" })
  }

  res.locals.data = formatWudUpdateEvent(payload)
  res.locals.wudContainer = payload
  return next()
}
