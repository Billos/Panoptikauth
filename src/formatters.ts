import { getContinentEmoji, getCountryEmoji } from "./emoji"
import { FormattedEvent, LoginEventData, LoginFailedEventData } from "./types"

export function formatLoginEvent(loginData: LoginEventData, username?: string, email?: string, ipAddress?: string): FormattedEvent {
  const lines: string[] = []

  lines.push("🔐 **Login Event**\n")

  // User information
  if (username || email) {
    lines.push(`\n**User:** ${username || "N/A"}${email ? ` (${email})` : ""}`)
  }

  // IP address
  if (ipAddress) {
    lines.push(`\n**IP Address:** ${ipAddress}`)
  }

  // Known device status
  if (loginData.auth_method_args?.known_device !== undefined) {
    const deviceStatus = loginData.auth_method_args.known_device ? "✅ Known device" : "⚠️ Unknown device"
    lines.push(`\n**Device Status:** ${deviceStatus}`)
  }

  // MFA devices
  if (loginData.auth_method_args?.mfa_devices && loginData.auth_method_args.mfa_devices.length > 0) {
    const mfaList = loginData.auth_method_args.mfa_devices
      .map((device) => `- ${device.app} (${device.name}, ${device.model_name})`)
      .join("\n")
    lines.push(`\n**MFA Devices Used:**\n${mfaList}`)
  }

  // Geolocation information
  if (loginData.geo) {
    const geoParts: string[] = []
    if (loginData.geo.continent) geoParts.push(`\n - Continent: ${getContinentEmoji(loginData.geo.continent)} ${loginData.geo.continent}`)
    if (loginData.geo.country) geoParts.push(`\n - Country: ${getCountryEmoji(loginData.geo.country)} ${loginData.geo.country}`)
    if (loginData.geo.city) geoParts.push(`\n - City: ${loginData.geo.city}`)

    if (geoParts.length > 0) {
      lines.push(`\n**Location:** ${geoParts.join(", ")}`)
    }

    if (loginData.geo.lat !== undefined && loginData.geo.long !== undefined) {
      lines.push(`**Coordinates:** ${loginData.geo.lat}, ${loginData.geo.long}`)
    }
  }

  // ASN information
  if (loginData.asn) {
    const asnParts: string[] = []
    if (loginData.asn.asn !== undefined) asnParts.push(`ASN ${loginData.asn.asn}`)
    if (loginData.asn.as_org) asnParts.push(loginData.asn.as_org)
    if (loginData.asn.network) asnParts.push(`(${loginData.asn.network})`)

    if (asnParts.length > 0) {
      lines.push(`\n**ASN:** ${asnParts.join(" ")}`)
    }
  }

  const title = `Login: ${username || "Unknown user"}`
  const message = lines.join("\n")
  return { title, message }
}

export function formatLoginFailedEvent(failedData: LoginFailedEventData): FormattedEvent {
  const lines: string[] = []

  lines.push("❌ **Login Failed Event**")
  // User information
  if (failedData.username) {
    lines.push(`\n**User:** ${failedData.username}`)
  }

  // Stage information
  if (failedData.stage) {
    lines.push(`\n**Failed Stage:** ${failedData.stage.app} (${failedData.stage.name}, ${failedData.stage.model_name})`)
  }

  const title = `Login Failed: ${failedData.username || "Unknown user"}`
  const message = lines.join("\n")
  return { title, message }
}

export function formatDefaultEvent(userUsername?: string, userEmail?: string, body?: string): FormattedEvent {
  const title = `Notification from ${userUsername || "System"}`
  const message = `${body}\n\nUser: ${userUsername || "N/A"} (${userEmail || "N/A"})`

  return { title, message }
}
