import { IncomingWebhookSendArguments } from "@slack/webhook"
import { NextFunction, Request, Response } from "express"

import { GotifyQuery } from "../middleware/gotifyParameters"
import { FormattedEvent } from "../types/gotify"

type Body = IncomingWebhookSendArguments

export async function handleSlackRequest(
  req: Request<{}, {}, Body, GotifyQuery>,
  res: Response<{}, { data: FormattedEvent }>,
  next: NextFunction,
) {
  console.log("Received Slack test notification:", req.body)

  const { title } = req.query
  const { text = "" } = req.body

  res.locals.data = { title: title || "Slack Notification", message: text }
  return next()
}
