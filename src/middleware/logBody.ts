import { NextFunction, Request, Response } from "express"

import { FormattedEvent } from "../types/gotify"
import { GotifyQuery } from "./gotifyParameters"

export async function logBody(req: Request<{}, {}, {}, GotifyQuery>, _res: Response<{}, { data: FormattedEvent }>, next: NextFunction) {
  // Log path and body for debugging
  console.log("Received request on path: %s, body: %o", req.path, req.body)
  return next()
}
