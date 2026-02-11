import { NextFunction, Request, Response } from "express"

import { Gotify } from "../gotify"
import { FormattedEvent } from "../types/gotify"
import { GotifyQuery } from "./gotifyParameters"

export async function gotifySend(req: Request<{}, {}, {}, GotifyQuery>, res: Response<{}, { data: FormattedEvent }>, _next: NextFunction) {
  try {
    const gotify = new Gotify(req.query)
    await gotify.sendMessage(res.locals.data.title, res.locals.data.message, 5)
  } catch (error) {
    return res.status(500).json({ error: "Failed to send message to Gotify", details: error })
  }
  return res.status(200).json({ status: "ok", service: "panoptikauth" })
}
