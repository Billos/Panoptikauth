import { NextFunction, Request, Response } from "express"

import { formatPortainerEvent } from "../formatters/portainer"
import { GotifyQuery } from "../middleware/gotifyParameters"
import { FormattedEvent } from "../types/gotify"
import { PortainerWebhookPayload } from "../types/portainer"

export async function handlePortainerRequest(
  req: Request<{}, {}, PortainerWebhookPayload, GotifyQuery>,
  res: Response<{}, { data: FormattedEvent }>,
  next: NextFunction,
) {
  // Parse the JSON from body
  let payload: PortainerWebhookPayload
  try {
    payload = typeof req.body === "string" ? JSON.parse(req.body) : req.body
  } catch (parseError) {
    console.error("Failed to parse Portainer notification:", parseError)
    res.status(400).json({ error: "Invalid JSON payload" })
    return
  }

  // Validate required fields
  if (!payload.status || !Array.isArray(payload.alerts)) {
    res.status(400).json({ error: "Missing required fields: status or alerts" })
    return
  }

  res.locals.data = formatPortainerEvent(payload)
  return next()
}
