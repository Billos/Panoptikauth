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
  const { title = "Slack Notification" } = req.query
  const { text: message = "" } = req.body

  res.locals.data = { title, message }
  return next()
}
