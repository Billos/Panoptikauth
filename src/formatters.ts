import { FormattedEvent, LoginEventData, LoginFailedEventData } from "./types"

export function formatLoginEvent(loginData: LoginEventData, username?: string, email?: string): FormattedEvent {
  const lines: string[] = []

  lines.push("🔐 **Login Event**\n")

  // User information
  if (username || email) {
    lines.push(`\n**User:** ${username || "N/A"}${email ? ` (${email})` : ""}`)
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
