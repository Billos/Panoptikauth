import { getContinentEmoji, getCountryEmoji } from "./emoji"
import { TemplatingService } from "./templating"
import { FormattedEvent, LoginEventData, LoginFailedEventData, UserWriteEventData } from "./types"

const templating = new TemplatingService()

type GeoContext = {
  continent?: string
  continentEmoji?: string
  country?: string
  countryEmoji?: string
  city?: string
  lat?: number
  long?: number
}

type AsnContext = {
  asn?: number
  as_org?: string
  network?: string
}

function buildGeoContext(data: LoginEventData): GeoContext | undefined {
  const { geo } = data
  if (!geo) {
    return undefined
  }
  return {
    continent: geo.continent,
    continentEmoji: geo.continent ? getContinentEmoji(geo.continent) : undefined,
    country: geo.country,
    countryEmoji: geo.country ? getCountryEmoji(geo.country) : undefined,
    city: geo.city,
    lat: geo.lat,
    long: geo.long,
  }
}

function buildAsnContext(data: LoginEventData): AsnContext | undefined {
  const { asn } = data
  if (!asn) {
    return undefined
  }
  if (asn.asn === undefined && !asn.as_org && !asn.network) {
    return undefined
  }
  return { asn: asn.asn, as_org: asn.as_org, network: asn.network }
}

export function formatLoginEvent(ipAddress: string, data: LoginEventData, username?: string, email?: string): FormattedEvent {
  const context: Record<string, unknown> = {
    username,
    email,
    knownDevice: data.auth_method_args?.known_device,
    mfaDevices: data.auth_method_args?.mfa_devices ?? [],
    ipAddress,
    geo: buildGeoContext(data),
    asn: buildAsnContext(data),
  }
  const title = `Login: ${username || "Unknown user"}`
  const message = templating.render("login.njk", context)
  return { title, message }
}

export function formatLoginFailedEvent(ipAddress: string, data: LoginFailedEventData): FormattedEvent {
  const context: Record<string, unknown> = {
    username: data.username,
    ipAddress,
    stage: data.stage,
  }
  const title = `Login Failed: ${data.username || "Unknown user"}`
  const message = templating.render("login-failed.njk", context)
  return { title, message }
}

export function formatDefaultEvent(ipAddress: string, userUsername?: string, userEmail?: string, body?: string): FormattedEvent {
  const context: Record<string, unknown> = {
    body,
    userUsername,
    userEmail,
    ipAddress,
  }
  const title = `Notification from ${userUsername || "System"}`
  const message = templating.render("default.njk", context)
  return { title, message }
}

export function formatUserWriteEvent(ipAddress: string, data: UserWriteEventData): FormattedEvent {
  const isNewUser = data.created === true
  const eventIcon = isNewUser ? "👤" : "✏️"
  const eventType = isNewUser ? "User Created" : "User Updated"

  const httpRequest =
    data.http_request && (data.http_request.method || data.http_request.path)
      ? { method: data.http_request.method, path: data.http_request.path }
      : undefined

  const context: Record<string, unknown> = {
    isNewUser,
    eventIcon,
    eventType,
    username: data.username,
    name: data.name,
    email: data.email,
    locale: data.attributes?.settings?.locale,
    httpRequest,
    ipAddress,
    geo: buildGeoContext(data),
    asn: buildAsnContext(data),
  }
  const title = `${eventType}: ${data.username || data.name || "Unknown user"}`
  const message = templating.render("user-write.njk", context)
  return { title, message }
}
