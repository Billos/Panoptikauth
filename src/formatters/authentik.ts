import { AuthentikExtractor } from "../extractors/authentik"
import { LoginEventData, LoginFailedEventData, UserWriteEventData } from "../types/authentik"
import { FormattedEvent } from "../types/gotify"

export function formatLoginEvent(ipAddress: string, data: LoginEventData, username?: string, email?: string): FormattedEvent {
  const extractor = new AuthentikExtractor()

  extractor.addLine("🔐 **Login Event**\n")

  // User information
  extractor.extractUserInfo(data, username, email)

  // Known device status
  extractor.extractDeviceStatus(data)

  // MFA devices
  extractor.extractMfaDevices(data)

  // IP address
  extractor.extractIpAddress(ipAddress)

  // Geolocation information
  extractor.extractGeoLocation(data)

  // ASN information
  extractor.extractAsnInfo(data)

  const title = `Login: ${username || "Unknown user"}`
  const message = extractor.getResult()
  return { title, message }
}

export function formatLoginFailedEvent(ipAddress: string, data: LoginFailedEventData): FormattedEvent {
  const extractor = new AuthentikExtractor()

  extractor.addLine("❌ **Login Failed Event**")

  // User information
  extractor.extractUsername(data)

  // MFA devices
  extractor.extractMfaDevices(data)

  // IP address
  extractor.extractIpAddress(ipAddress)

  // Geolocation information
  extractor.extractGeoLocation(data)

  // ASN information
  extractor.extractAsnInfo(data)

  // Stage information
  extractor.extractStageInfo(data)

  const title = `Login Failed: ${data.username || "Unknown user"}`
  const message = extractor.getResult()
  return { title, message }
}

export function formatDefaultEvent(ipAddress: string, userUsername?: string, userEmail?: string, body?: string): FormattedEvent {
  const extractor = new AuthentikExtractor()

  extractor.addLine("ℹ️ **Default Event**")
  extractor.extractIpAddress(ipAddress)

  const title = `Notification from ${userUsername || "System"}`
  const message = `${body}\n\nUser: ${userUsername || "N/A"} (${userEmail || "N/A"})`
  return { title, message }
}

export function formatUserWriteEvent(ipAddress: string, data: UserWriteEventData): FormattedEvent {
  const extractor = new AuthentikExtractor()

  const isNewUser = data.created === true
  const eventIcon = isNewUser ? "👤" : "✏️"
  const eventType = isNewUser ? "User Created" : "User Updated"

  extractor.addLine(`${eventIcon} **${eventType}**\n`)

  // User information
  extractor.extractUsername(data)
  extractor.extractName(data)
  extractor.extractEmail(data)

  // User attributes
  extractor.extractLocale(data)

  // HTTP request details
  extractor.extractHttpRequest(data)

  // IP address
  extractor.extractIpAddress(ipAddress)

  // Geolocation information
  extractor.extractGeoLocation(data)

  // ASN information
  extractor.extractAsnInfo(data)

  const title = `${eventType}: ${data.username || data.name || "Unknown user"}`
  const message = extractor.getResult()
  return { title, message }
}
