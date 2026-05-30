/**
 * Panoptikauth
 * Entry point for the application
 */

import express from "express"

import { handleAuthentikWebhook } from "./controllers/authentik"
import { handleFail2banBan } from "./controllers/fail2ban"
import { handleHealthCheck } from "./controllers/health"
import { handleSlackRequest } from "./controllers/slack"
import { handleTracearrRequest } from "./controllers/tracearr"
import { startFail2banCron } from "./cron/fail2ban"
import { gotifyParameters } from "./middleware/gotifyParameters"
import { gotifySend } from "./middleware/gotifySend"
import { logBody } from "./middleware/logBody"

const app = express()

// Configuration from environment variables
const PORT = process.env.PORT || 3000

// Middleware to parse text/json content type
app.use(express.json())

// POST endpoint to receive Authentik notifications
app.get("/health", handleHealthCheck)
app.post("/authentik", logBody, gotifyParameters, handleAuthentikWebhook, gotifySend)
app.post("/slack", logBody, gotifyParameters, handleSlackRequest, gotifySend)
app.post("/tracearr", logBody, gotifyParameters, handleTracearrRequest, gotifySend)
app.post("/fail2ban", logBody, handleFail2banBan)

/**
 * Send notification to Gotify using multipart/form-data
 */
function main(): void {
  console.log("Panoptikauth starting...")
  console.log("Environment:", process.env.NODE_ENV || "development")

  startFail2banCron()

  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`)
    console.log(`Webhook endpoint: http://localhost:${PORT}/webhook`)
    console.log(`Slack endpoint: http://localhost:${PORT}/slack`)
    console.log(`Tracearr endpoint: http://localhost:${PORT}/tracearr`)
    console.log(`fail2ban endpoint: http://localhost:${PORT}/fail2ban`)
    console.log(`Health check: http://localhost:${PORT}/health`)
  })
}

main()
