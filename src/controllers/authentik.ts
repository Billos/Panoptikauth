import { NextFunction, Request, Response } from "express"

import { formatDefaultEvent, formatLoginEvent, formatLoginFailedEvent, formatUserWriteEvent } from "../formatters/authentik"
import { GotifyQuery } from "../middleware/gotifyParameters"
import { isLoginEvent, isLoginFailedEvent, isUserWriteEvent, parseLoginEvent, parseLoginFailedEvent, parseUserWriteEvent } from "../parsers"
import { AuthentikNotification } from "../types/authentik"
import { FormattedEvent } from "../types/gotify"

export async function handleAuthentikWebhook(
  { body, headers }: Request<{}, {}, AuthentikNotification, GotifyQuery>,
  res: Response<{}, { data: FormattedEvent }>,
  next: NextFunction,
) {
  // Extract IP address from headers
  const ipAddress = headers["ip"] as string

  // Validate required fields
  if (!body.body) {
    return res.status(400).json({ error: "Missing required field: body" })
  }

  if (isLoginEvent(body.body)) {
    const loginData = parseLoginEvent(body.body)
    res.locals.data = formatLoginEvent(ipAddress, loginData, body.event_user_username, body.event_user_email)
  } else if (isLoginFailedEvent(body.body)) {
    const failedData = parseLoginFailedEvent(body.body)
    res.locals.data = formatLoginFailedEvent(ipAddress, failedData)
  } else if (isUserWriteEvent(body.body)) {
    const userData = parseUserWriteEvent(body.body)
    res.locals.data = formatUserWriteEvent(ipAddress, userData)
  } else {
    res.locals.data = formatDefaultEvent(ipAddress, body.event_user_username, body.event_user_email, body.body)
  }

  return next()
}
