import { NextFunction, Request, Response } from "express"

import { Gotify } from "../gotify"
import { FormattedEvent } from "../types/gotify"
import { WudContainer } from "../types/wud"
import { getTrackedWudUpdates, trackWudUpdate } from "../wudTracker"
import { GotifyQuery } from "./gotifyParameters"

export async function wudGotifySend(
  req: Request<{}, {}, {}, GotifyQuery>,
  res: Response<{}, { data: FormattedEvent; wudContainer: WudContainer }>,
  _next: NextFunction,
) {
  const { wudContainer } = res.locals
  const clientToken = process.env.GOTIFY_CLIENT_TOKEN

  // If a notification for this container is already tracked, delete the stale one first
  const existing = getTrackedWudUpdates().get(wudContainer.id)
  if (existing && clientToken) {
    const gotify = new Gotify({ url: existing.gotifyUrl, token: "" })
    await gotify.deleteMessage(existing.messageId, clientToken).catch((err) => {
      console.error("wudGotifySend: failed to delete stale Gotify message:", err)
    })
  }

  try {
    const gotify = new Gotify(req.query)
    const messageId = await gotify.sendMessage(res.locals.data.title, res.locals.data.message, res.locals.data.priority ?? 5, {
      "panoptikauth::wud": { containerId: wudContainer.id },
    })
    trackWudUpdate(wudContainer.id, { messageId, gotifyUrl: req.query.url })
  } catch (error) {
    return res.status(500).json({ error: "Failed to send message to Gotify", details: error })
  }
  return res.status(200).json({ status: "ok", service: "panoptikauth" })
}
