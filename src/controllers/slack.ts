import { IncomingWebhookSendArguments } from "@slack/webhook"
import { Request, Response } from "express"
import { z } from "zod"

import { Gotify } from "../gotify"
import { FormattedEvent } from "../types"

const SlackQuerySchema = z.object({
  token: z.string(),
  url: z.url(),
  title: z.string(),
})

type SlackQuery = z.infer<typeof SlackQuerySchema>

type Body = IncomingWebhookSendArguments

export async function handleSlackRequest(req: Request<{}, {}, Body, SlackQuery>, res: Response) {
  const parsed = SlackQuerySchema.safeParse(req.query)
  if (!parsed.success) {
    console.log("Failed to parse Slack request query:", parsed.error)
    return res.status(400).json(parsed.error)
  }

  console.log("Received Slack test notification:", req.body)
  console.log("Received parameters:", req.query)

  const { token, url, title } = req.query
  const { text = "" } = req.body

  const formattedEvent: FormattedEvent = { title, message: text }
  const priority = 5 // Normal priority
  try {
    const gotify = new Gotify(url, token)
    await gotify.sendMessage(formattedEvent.title, formattedEvent.message, priority)
  } catch (error) {
    return res.status(500).json({ error: "Failed to send message to Gotify", details: error })
  }
  return res.status(200).json({ status: "ok", service: "panoptikauth" })
}
