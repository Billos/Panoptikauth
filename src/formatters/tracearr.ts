import { TracearrExtractor } from "../extractors/tracearr"
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
  const extractor = new TracearrExtractor()
  const { user, rule, violation } = payload.data

  extractor.addLine("🚨 **Violation Detected**\n")
  extractor.addLine(`\n**User:** ${user.displayName} (@${user.username})`)
  extractor.addLine(`\n**Rule:** ${rule.name} (${rule.type})`)
  extractor.addLine(`\n**Severity:** ${violation.severity}`)
  if (violation.details) {
    extractor.addLine(`\n**Details:** ${JSON.stringify(violation.details, null, 2)}`)
  }
  extractor.addLine(`\n**Timestamp:** ${new Date(payload.timestamp).toLocaleString()}`)

  const title = `Violation: ${user.displayName} - ${rule.name}`
  const message = extractor.getResult()
  return { title, message }
}

function formatTracearrStreamStarted(payload: TracearrStreamStartedPayload): FormattedEvent {
  const extractor = new TracearrExtractor()
  const { user, media, playback, location } = payload.data

  extractor.addLine("▶️ **Stream Started**\n")
  extractor.addLine(`\n**User:** ${user.displayName} (@${user.username})`)
  extractor.addLine(`\n**Media:** ${media.title}`)
  if (media.subtitle) {
    extractor.addLine(`\n**Episode:** ${media.subtitle}`)
  }
  extractor.addLine(`\n**Type:** ${media.type}`)
  if (media.year) {
    extractor.addLine(`\n**Year:** ${media.year}`)
  }
  extractor.addLine(`\n**Playback:** ${playback.type}`)
  if (playback.quality) {
    extractor.addLine(`\n**Quality:** ${playback.quality}`)
  }
  if (playback.player) {
    extractor.addLine(`\n**Player:** ${playback.player}`)
  }
  if (location.city || location.country) {
    const locationStr = [location.city, location.country].filter(Boolean).join(", ")
    extractor.addLine(`\n**Location:** ${locationStr}`)
  }
  extractor.addLine(`\n**Timestamp:** ${new Date(payload.timestamp).toLocaleString()}`)

  const title = `Stream Started: ${user.displayName} - ${media.title}`
  const message = extractor.getResult()
  return { title, message }
}

function formatTracearrStreamStopped(payload: TracearrStreamStoppedPayload): FormattedEvent {
  const extractor = new TracearrExtractor()
  const { user, media, session } = payload.data

  extractor.addLine("⏹️ **Stream Stopped**\n")
  extractor.addLine(`\n**User:** ${user.displayName} (@${user.username})`)
  extractor.addLine(`\n**Media:** ${media.title}`)
  if (media.subtitle) {
    extractor.addLine(`\n**Episode:** ${media.subtitle}`)
  }
  extractor.addLine(`\n**Type:** ${media.type}`)
  if (session.durationMs) {
    const durationMin = Math.floor(session.durationMs / 60000)
    extractor.addLine(`\n**Duration:** ${durationMin} minutes`)
  }
  extractor.addLine(`\n**Timestamp:** ${new Date(payload.timestamp).toLocaleString()}`)

  const title = `Stream Stopped: ${user.displayName} - ${media.title}`
  const message = extractor.getResult()
  return { title, message }
}

function formatTracearrServer(payload: TracearrServerPayload): FormattedEvent {
  const extractor = new TracearrExtractor()
  const { serverName, serverType } = payload.data

  const isDown = payload.event === "server_down"
  const icon = isDown ? "🔴" : "🟢"
  const status = isDown ? "Down" : "Up"

  extractor.addLine(`${icon} **Server ${status}**\n`)
  extractor.addLine(`\n**Server:** ${serverName}`)
  extractor.addLine(`\n**Type:** ${serverType}`)
  extractor.addLine(`\n**Timestamp:** ${new Date(payload.timestamp).toLocaleString()}`)

  const title = `Server ${status}: ${serverName}`
  const message = extractor.getResult()
  return { title, message }
}

function formatTracearrNewDevice(payload: TracearrNewDevicePayload): FormattedEvent {
  const extractor = new TracearrExtractor()
  const { userName, deviceName, platform, location } = payload.data

  extractor.addLine("📱 **New Device Detected**\n")
  extractor.addLine(`\n**User:** ${userName}`)
  extractor.addLine(`\n**Device:** ${deviceName}`)
  extractor.addLine(`\n**Platform:** ${platform}`)
  if (location) {
    extractor.addLine(`\n**Location:** ${location}`)
  }
  extractor.addLine(`\n**Timestamp:** ${new Date(payload.timestamp).toLocaleString()}`)

  const title = `New Device: ${userName} - ${deviceName}`
  const message = extractor.getResult()
  return { title, message }
}

function formatTracearrTrustScore(payload: TracearrTrustScorePayload): FormattedEvent {
  const extractor = new TracearrExtractor()
  const { userName, previousScore, newScore, reason } = payload.data

  const isIncrease = newScore > previousScore
  const icon = isIncrease ? "📈" : "📉"
  const change = isIncrease ? "Increased" : "Decreased"

  extractor.addLine(`${icon} **Trust Score ${change}**\n`)
  extractor.addLine(`\n**User:** ${userName}`)
  extractor.addLine(`\n**Previous Score:** ${previousScore}`)
  extractor.addLine(`\n**New Score:** ${newScore}`)
  extractor.addLine(`\n**Reason:** ${reason}`)
  extractor.addLine(`\n**Timestamp:** ${new Date(payload.timestamp).toLocaleString()}`)

  const title = `Trust Score ${change}: ${userName}`
  const message = extractor.getResult()
  return { title, message }
}

function formatTracearrTest(payload: TracearrTestPayload): FormattedEvent {
  const extractor = new TracearrExtractor()

  extractor.addLine("🧪 **Tracearr Test Event**\n")
  extractor.addLine(`\n**Message:** ${payload.data.message}`)
  extractor.addLine(`\n**Timestamp:** ${new Date(payload.timestamp).toLocaleString()}`)

  const title = `Tracearr Test: ${payload.data.message}`
  const message = extractor.getResult()
  return { title, message }
}
