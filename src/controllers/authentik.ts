import { NextFunction, Request, Response } from "express"

import { formatDefaultEvent, formatLoginEvent, formatLoginFailedEvent, formatUserWriteEvent } from "../formatters/authentik"
import { GotifyQuery } from "../middleware/gotifyParameters"
import { isLoginEvent, isLoginFailedEvent, isUserWriteEvent, parseLoginEvent, parseLoginFailedEvent, parseUserWriteEvent } from "../parsers"
import { AuthentikNotification } from "../types/authentik"
import { FormattedEvent } from "../types/gotify"

export async function handleAuthentikWebhook(
  req: Request<{}, {}, AuthentikNotification, GotifyQuery>,
  res: Response<{}, { data: FormattedEvent }>,
  next: NextFunction,
) {
  console.log("Received notification from Authentik", req.body)
  let notification = req.body

  // Extract IP address from headers
  const ipAddress = req.headers["ip"] as string

  // Validate required fields
  if (!notification.body) {
    return res.status(400).json({ error: "Missing required field: body" })
  }

  if (isLoginEvent(notification.body)) {
    const loginData = parseLoginEvent(notification.body)
    res.locals.data = formatLoginEvent(ipAddress, loginData, notification.event_user_username, notification.event_user_email)
  } else if (isLoginFailedEvent(notification.body)) {
    const failedData = parseLoginFailedEvent(notification.body)
    res.locals.data = formatLoginFailedEvent(ipAddress, failedData)
  } else if (isUserWriteEvent(notification.body)) {
    const userData = parseUserWriteEvent(notification.body)
    res.locals.data = formatUserWriteEvent(ipAddress, userData)
  } else {
    res.locals.data = formatDefaultEvent(ipAddress, notification.event_user_username, notification.event_user_email, notification.body)
  }

  return next()
}
