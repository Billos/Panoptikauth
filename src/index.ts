/**
 * Panoptikauth
 * Entry point for the application
 */

import express from "express"

import { handleAuthentikWebhook } from "./controllers/authentik"
import { handleHealthCheck } from "./controllers/health"
import { handleSlackRequest } from "./controllers/slack"
import { handleTracearrRequest } from "./controllers/tracearr"
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

/**
 * Send notification to Gotify using multipart/form-data
 */
function main(): void {
  console.log("Panoptikauth starting...")
  console.log("Environment:", process.env.NODE_ENV || "development")

  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`)
    console.log(`Webhook endpoint: http://localhost:${PORT}/webhook`)
    console.log(`Slack endpoint: http://localhost:${PORT}/slack`)
    console.log(`Tracearr endpoint: http://localhost:${PORT}/tracearr`)
    console.log(`Health check: http://localhost:${PORT}/health`)
  })
}

main()
