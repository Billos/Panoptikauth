/**
 * Panoptikauth
 * Entry point for the application
 */

import { IncomingWebhookSendArguments } from "@slack/webhook"
import express, { Request, Response } from "express"

import {
  formatDefaultEvent,
  formatLoginEvent,
  formatLoginFailedEvent,
  formatTracearrEvent,
  formatUserWriteEvent,
} from "./formatters"
import { Gotify } from "./gotify"
import { isLoginEvent, isLoginFailedEvent, isUserWriteEvent, parseLoginEvent, parseLoginFailedEvent, parseUserWriteEvent } from "./parsers"
import { AuthentikNotification, FormattedEvent, TracearrWebhookPayload } from "./types"

const app = express()

// Configuration from environment variables
const PORT = process.env.PORT || 3000
const GOTIFY_URL = process.env.GOTIFY_URL || ""
const GOTIFY_TOKEN_AUTHENTIK = process.env.GOTIFY_TOKEN_AUTHENTIK || ""
const GOTIFY_TOKEN_SLACK = process.env.GOTIFY_TOKEN_SLACK || ""
const GOTIFY_TOKEN_TRACEARR = process.env.GOTIFY_TOKEN_TRACEARR || ""
const NOTIFICATION_SLACK_TITLE = process.env.NOTIFICATION_SLACK_TITLE || "Slack Notification"

// Middleware to parse text/json content type
app.use(express.json())

// POST endpoint to receive Authentik notifications
app.post("/webhook", async (req: Request, res: Response): Promise<void> => {
  try {
    console.log("Received notification from Authentik")
    // Parse the JSON from text body
    let notification: AuthentikNotification
    try {
      notification = typeof req.body === "string" ? JSON.parse(req.body) : req.body
    } catch (parseError) {
      console.error("Failed to parse notification:", parseError)
      res.status(400).json({ error: "Invalid JSON payload" })
      return
    }

    console.log("Parsed notification:", notification)

    // Extract IP address from headers
    const ipAddress = req.headers["ip"] as string

    // Validate required fields
    if (!notification.body) {
      res.status(400).json({ error: "Missing required field: body" })
      return
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
    const gotify = new Gotify(GOTIFY_URL, GOTIFY_TOKEN_AUTHENTIK)
    await gotify.sendMessage(formattedEvent.title, formattedEvent.message, priority)

    console.log("Notification forwarded to Gotify successfully")
    res.status(200).json({ success: true, message: "Notification forwarded to Gotify" })
  } catch (error) {
    console.error("Error processing notification:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Health check endpoint
app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({ status: "ok", service: "panoptikauth" })
})

app.post("/slack", async (req: Request<{}, {}, IncomingWebhookSendArguments>, res: Response) => {
  console.log("Received Slack test notification:", req.body)
  const formattedEvent: FormattedEvent = {
    title: NOTIFICATION_SLACK_TITLE,
    message: req.body.text || "Empty notification from Panoptikauth.",
  }
  const priority = 5 // Normal priority
  const gotify = new Gotify(GOTIFY_URL, GOTIFY_TOKEN_SLACK)
  await gotify.sendMessage(formattedEvent.title, formattedEvent.message, priority)
  res.status(200).json({ status: "ok", service: "panoptikauth" })
})

// POST endpoint to receive Tracearr notifications
app.post("/tracearr", async (req: Request, res: Response): Promise<void> => {
  try {
    console.log("Received notification from Tracearr")

    // Parse the JSON from body
    let payload: TracearrWebhookPayload
    try {
      payload = typeof req.body === "string" ? JSON.parse(req.body) : req.body
    } catch (parseError) {
      console.error("Failed to parse Tracearr notification:", parseError)
      res.status(400).json({ error: "Invalid JSON payload" })
      return
    }

    console.log("Parsed Tracearr notification:", payload)

    // Validate required fields
    if (!payload.event || !payload.timestamp || !payload.data) {
      res.status(400).json({ error: "Missing required fields: event, timestamp, or data" })
      return
    }

    // Format the event
    const formattedEvent = formatTracearrEvent(payload)

    // Map event types to priority
    const priorityMap: { [key: string]: number } = {
      violation_detected: 10, // Critical
      server_down: 10, // Critical
      server_up: 5, // Normal
      stream_started: 3, // Low
      stream_stopped: 3, // Low
      new_device: 7, // High
      trust_score_changed: 5, // Normal
    }
    const priority = priorityMap[payload.event] || 5

    // Send to Gotify
    const gotify = new Gotify(GOTIFY_URL, GOTIFY_TOKEN_TRACEARR)
    await gotify.sendMessage(formattedEvent.title, formattedEvent.message, priority)

    console.log("Tracearr notification forwarded to Gotify successfully")
    res.status(200).json({ success: true, message: "Notification forwarded to Gotify" })
  } catch (error) {
    console.error("Error processing Tracearr notification:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

/**
 * Send notification to Gotify using multipart/form-data
 */
function main(): void {
  if (!GOTIFY_URL) {
    console.error("GOTIFY_URL environment variable not set")
    process.exit(1)
  }
  if (!GOTIFY_TOKEN_AUTHENTIK) {
    console.error("GOTIFY_TOKEN_AUTHENTIK environment variable not set")
    process.exit(1)
  }
  if (!GOTIFY_TOKEN_SLACK) {
    console.error("GOTIFY_TOKEN_SLACK environment variable not set")
    process.exit(1)
  }
  if (!GOTIFY_TOKEN_TRACEARR) {
    console.error("GOTIFY_TOKEN_TRACEARR environment variable not set")
    process.exit(1)
  }

  console.log("Panoptikauth starting...")
  console.log("Environment:", process.env.NODE_ENV || "development")
  console.log("Gotify URL:", GOTIFY_URL)
  console.log("Gotify Token AUTHENTIK configured:", GOTIFY_TOKEN_AUTHENTIK ? "Yes" : "No")

  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`)
    console.log(`Webhook endpoint: http://localhost:${PORT}/webhook`)
    console.log(`Slack endpoint: http://localhost:${PORT}/slack`)
    console.log(`Tracearr endpoint: http://localhost:${PORT}/tracearr`)
    console.log(`Health check: http://localhost:${PORT}/health`)
  })
}

main()
