import { TemplatingService } from "../templating"
import { FormattedEvent } from "../types/gotify"
import {
  TracearrNewDevicePayload,
  TracearrServerPayload,
  TracearrStreamStartedPayload,
  TracearrStreamStoppedPayload,
  TracearrTestPayload,
  TracearrTrustScorePayload,
  TracearrViolationPayload,
  TracearrWebhookPayload,
} from "../types/tracearr"

const locale = process.env.LOCALE || "en-US"
const timeZone = process.env.TZ || "UTC"

// Tracearr formatters
export function formatTracearrEvent(payload: TracearrWebhookPayload): FormattedEvent {
  switch (payload.event) {
    case "violation_detected":
      return formatTracearrViolation(payload)
    case "stream_started":
      return formatTracearrStreamStarted(payload)
    case "stream_stopped":
      return formatTracearrStreamStopped(payload)
    case "server_down":
    case "server_up":
      return formatTracearrServer(payload)
    case "new_device":
      return formatTracearrNewDevice(payload)
    case "trust_score_changed":
      return formatTracearrTrustScore(payload)
    case "test":
      return formatTracearrTest(payload)
  }
}

function formatTracearrViolation(payload: TracearrViolationPayload): FormattedEvent {
  const templating = new TemplatingService()
  const { user, rule, violation } = payload.data

  const title = `Violation: ${user.displayName} - ${rule.name}`
  const message = templating.render("tracearr/violation.njk", {
    user,
    rule,
    violation,
    timestamp: new Date(payload.timestamp).toLocaleString(locale, { timeZone }),
  })
  return { title, message }
}

function formatTracearrStreamStarted(payload: TracearrStreamStartedPayload): FormattedEvent {
  const templating = new TemplatingService()
  const { user, media, playback, location } = payload.data
  const title = `Stream Started: ${user.displayName} - ${media.title}`
  const message = templating.render("tracearr/stream-started.njk", {
    user,
    media,
    playback,
    location: [location.city, location.country].filter(Boolean).join(", "),
    timestamp: new Date(payload.timestamp).toLocaleString(locale, { timeZone }),
  })
  return { title, message }
}

function formatTracearrStreamStopped(payload: TracearrStreamStoppedPayload): FormattedEvent {
  const templating = new TemplatingService()
  const { user, media, session } = payload.data

  const title = `Stream Stopped: ${user.displayName} - ${media.title}`
  const message = templating.render("tracearr/stream-stopped.njk", {
    user,
    media,
    session,
    timestamp: new Date(payload.timestamp).toLocaleString(locale, { timeZone }),
  })
  return { title, message }
}

function formatTracearrServer(payload: TracearrServerPayload): FormattedEvent {
  const templating = new TemplatingService()
  const { serverName, serverType } = payload.data

  const isDown = payload.event === "server_down"
  const icon = isDown ? "🔴" : "🟢"
  const status = isDown ? "Down" : "Up"

  const title = `Server ${status}: ${serverName}`
  const message = templating.render("tracearr/server.njk", {
    icon,
    status,
    serverName,
    serverType,
    timestamp: new Date(payload.timestamp).toLocaleString(locale, { timeZone }),
  })
  return { title, message }
}

function formatTracearrNewDevice(payload: TracearrNewDevicePayload): FormattedEvent {
  const templating = new TemplatingService()

  const { userName, deviceName, platform, location } = payload.data

  const title = `New Device: ${userName} - ${deviceName}`
  const message = templating.render("tracearr/new-device.njk", {
    user: { displayName: userName, username: userName },
    device: { name: deviceName, platform },
    location,
    timestamp: new Date(payload.timestamp).toLocaleString(locale, { timeZone }),
  })
  return { title, message }
}

function formatTracearrTrustScore(payload: TracearrTrustScorePayload): FormattedEvent {
  const templating = new TemplatingService()
  const { userName, previousScore, newScore, reason } = payload.data

  const isIncrease = newScore > previousScore
  const icon = isIncrease ? "📈" : "📉"
  const change = isIncrease ? "Increased" : "Decreased"

  const title = `Trust Score ${change}: ${userName}`
  const message = templating.render("tracearr/trust-score.njk", {
    icon,
    change,
    userName,
    previousScore,
    newScore,
    reason,
    timestamp: new Date(payload.timestamp).toLocaleString(locale, { timeZone }),
  })
  return { title, message }
}

function formatTracearrTest(payload: TracearrTestPayload): FormattedEvent {
  const templating = new TemplatingService()
  const title = `Tracearr Test: ${payload.data.message}`
  const message = templating.render("tracearr/test.njk", {
    payload,
    timestamp: new Date(payload.timestamp).toLocaleString(locale, { timeZone }),
  })
  return { title, message }
}
