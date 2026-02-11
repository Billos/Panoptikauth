import { IncomingWebhookSendArguments } from "@slack/webhook"
import { Request, Response } from "express"

import { Gotify } from "../gotify"
import { GotifyQuery } from "../middleware/gotifyParameters"
import { FormattedEvent } from "../types/gotify"

type Body = IncomingWebhookSendArguments

export async function handleSlackRequest(req: Request<{}, {}, Body, GotifyQuery>, res: Response) {
  console.log("Received Slack test notification:", req.body)
  console.log("Received parameters:", req.query)

  const { title } = req.query
  const { text = "" } = req.body

  const formattedEvent: FormattedEvent = { title: title || "Slack Notification", message: text }
  const priority = 5 // Normal priority
  try {
    const gotify = new Gotify(req.query)
    await gotify.sendMessage(formattedEvent.title, formattedEvent.message, priority)
  } catch (error) {
    return res.status(500).json({ error: "Failed to send message to Gotify", details: error })
  }
  return res.status(200).json({ status: "ok", service: "panoptikauth" })
}
