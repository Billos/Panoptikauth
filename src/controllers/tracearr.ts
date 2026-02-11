import { IncomingWebhookSendArguments } from "@slack/webhook"
import { Request, Response } from "express"

import { formatTracearrEvent } from "../formatters/tracearr"
import { Gotify } from "../gotify"
import { GotifyQuery } from "../middleware/gotifyParameters"
import { TracearrWebhookPayload } from "../types/tracearr"

type Body = IncomingWebhookSendArguments

export async function handleTracearrRequest(req: Request<{}, {}, Body, GotifyQuery>, res: Response) {
  console.log("Received Tracearr test notification:", req.body)
  console.log("Received parameters:", req.query)

  // Parse the JSON from body
  let payload: TracearrWebhookPayload
  try {
    payload = typeof req.body === "string" ? JSON.parse(req.body) : req.body
  } catch (parseError) {
    console.error("Failed to parse Tracearr notification:", parseError)
    res.status(400).json({ error: "Invalid JSON payload" })
    return
  }

  console.log("Parsed Tracearr notification:", payload)

  // Validate required fields
  if (!payload.event || !payload.timestamp || !payload.data) {
    res.status(400).json({ error: "Missing required fields: event, timestamp, or data" })
    return
  }

  // Format the event
  const formattedEvent = formatTracearrEvent(payload)
  const priority = 5 // Normal priority
  try {
    const gotify = new Gotify(req.query)
    await gotify.sendMessage(formattedEvent.title, formattedEvent.message, priority)
  } catch (error) {
    return res.status(500).json({ error: "Failed to send message to Gotify", details: error })
  }
  return res.status(200).json({ status: "ok", service: "panoptikauth" })
}
