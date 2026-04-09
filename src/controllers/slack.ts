import { NextFunction, Request, Response } from "express"

import { GotifyQuery } from "../middleware/gotifyParameters"
import { FormattedEvent } from "../types/gotify"
import { IncomingWebhookSendArguments } from "../types/slack"

export async function handleSlackRequest(
  req: Request<{}, {}, IncomingWebhookSendArguments, GotifyQuery>,
  res: Response<{}, { data: FormattedEvent }>,
  next: NextFunction,
) {
  const { title = "Slack Notification" } = req.query
  const { text: message = "" } = req.body

  res.locals.data = { title, message }
  return next()
}
