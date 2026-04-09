import { TemplatingService } from "../templating"
import { LoginEventData, LoginFailedEventData, UserWriteEventData } from "../types/authentik"
import { FormattedEvent } from "../types/gotify"

export function formatLoginEvent(ipAddress: string, data: LoginEventData, username?: string, email?: string): FormattedEvent {
  const title = `Login: ${username || "Unknown user"}`
  const templating = new TemplatingService()
  const message = templating.render("authentik/login.njk", {
    username,
    email,
    ipAddress,
    mfaDevices: data.auth_method_args?.mfa_devices || [],
    knownDevice: data.auth_method_args?.known_device,
    geo: data.geo,
    asn: data.asn,
  })
  return { title, message }
}

export function formatLoginFailedEvent(ipAddress: string, data: LoginFailedEventData): FormattedEvent {
  const title = `Login Failed: ${data.username || "Unknown user"}`
  const templating = new TemplatingService()
  const message = templating.render("authentik/login-failed.njk", {
    username: data.username,
    ipAddress,
    stage: data.stage,
  })

  return { title, message }
}

export function formatDefaultEvent(ipAddress: string, userUsername?: string, userEmail?: string, body?: string): FormattedEvent {
  const templating = new TemplatingService()
  const title = `Notification from ${userUsername || "System"}`
  const message = templating.render("authentik/default.njk", {
    body,
    userUsername,
    userEmail,
    ipAddress,
  })
  return { title, message }
}

export function formatUserWriteEvent(ipAddress: string, data: UserWriteEventData): FormattedEvent {
  const templating = new TemplatingService()

  const isNewUser = data.created === true
  const eventIcon = isNewUser ? "👤" : "✏️"
  const eventType = isNewUser ? "User Created" : "User Updated"

  const title = `${eventType}: ${data.username || data.name || "Unknown user"}`
  const message = templating.render("authentik/user-write.njk", {
    eventType,
    eventIcon,
    username: data.username,
    name: data.name,
    email: data.email,
    locale: data.attributes?.settings?.locale,
    ipAddress,
    httpRequest: data.http_request,
  })
  return { title, message }
}
