import { Request, Response } from "express"
import { z } from "zod"

import { formatDefaultEvent, formatLoginEvent, formatLoginFailedEvent, formatUserWriteEvent } from "../formatters/authentik"
import { Gotify } from "../gotify"
import { isLoginEvent, isLoginFailedEvent, isUserWriteEvent, parseLoginEvent, parseLoginFailedEvent, parseUserWriteEvent } from "../parsers"
import { AuthentikNotification } from "../types/authentik"
import { FormattedEvent } from "../types/gotify"

const AuthentikQuerySchema = z.object({
  token: z.string(),
  url: z.url(),
  title: z.string(),
})
type AuthentikQuery = z.infer<typeof AuthentikQuerySchema>

export async function handleAuthentikWebhook(req: Request<{}, {}, AuthentikNotification, AuthentikQuery>, res: Response) {
  const parsed = AuthentikQuerySchema.safeParse(req.query)
  if (!parsed.success) {
    console.log("Failed to parse Authentik request query:", parsed.error)
    return res.status(400).json(parsed.error)
  }

  console.log("Received notification from Authentik")
  try {
    let notification = req.body

    console.log("Parsed notification:", notification)

    // Extract IP address from headers
    const ipAddress = req.headers["ip"] as string

    // Validate required fields
    if (!notification.body) {
      return res.status(400).json({ error: "Missing required field: body" })
    }

    // Prepare message for Gotify
    let formattedEvent: FormattedEvent

    if (isLoginEvent(notification.body)) {
      const loginData = parseLoginEvent(notification.body)
      formattedEvent = formatLoginEvent(ipAddress, loginData, notification.event_user_username, notification.event_user_email)
    } else if (isLoginFailedEvent(notification.body)) {
      const failedData = parseLoginFailedEvent(notification.body)
      formattedEvent = formatLoginFailedEvent(ipAddress, failedData)
    } else if (isUserWriteEvent(notification.body)) {
      const userData = parseUserWriteEvent(notification.body)
      formattedEvent = formatUserWriteEvent(ipAddress, userData)
    } else {
      formattedEvent = formatDefaultEvent(ipAddress, notification.event_user_username, notification.event_user_email, notification.body)
    }

    // Map severity to priority (1-10, where 10 is highest)
    const priorityMap: { [key: string]: number } = { low: 2, normal: 5, medium: 5, high: 8, critical: 10 }
    const severityLower = notification.severity?.toLowerCase()
    const priority = severityLower ? priorityMap[severityLower] || 5 : 5

    // Send to Gotify
    const gotify = new Gotify(req.query)
    await gotify.sendMessage(formattedEvent.title, formattedEvent.message, priority)

    console.log("Notification forwarded to Gotify successfully")
    return res.status(200).json({ success: true, message: "Notification forwarded to Gotify" })
  } catch (error) {
    console.error("Error processing notification:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
}
