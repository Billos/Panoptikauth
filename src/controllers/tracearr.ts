import { IncomingWebhookSendArguments } from "@slack/webhook"
import { NextFunction, Request, Response } from "express"

import { formatTracearrEvent } from "../formatters/tracearr"
import { GotifyQuery } from "../middleware/gotifyParameters"
import { FormattedEvent } from "../types/gotify"
import { TracearrWebhookPayload } from "../types/tracearr"

type Body = IncomingWebhookSendArguments

export async function handleTracearrRequest(
  req: Request<{}, {}, Body, GotifyQuery>,
  res: Response<{}, { data: FormattedEvent }>,
  next: NextFunction,
) {
  // Parse the JSON from body
  let payload: TracearrWebhookPayload
  try {
    payload = typeof req.body === "string" ? JSON.parse(req.body) : req.body
  } catch (parseError) {
    console.error("Failed to parse Tracearr notification:", parseError)
    res.status(400).json({ error: "Invalid JSON payload" })
    return
  }

  // Validate required fields
  if (!payload.event || !payload.timestamp || !payload.data) {
    res.status(400).json({ error: "Missing required fields: event, timestamp, or data" })
    return
  }

  res.locals.data = formatTracearrEvent(payload)
  return next()
}
