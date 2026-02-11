/**
 * Type definitions for Authentik-Gotify Bridge
 */

// Interface for Authentik notification payload
export interface AuthentikNotification {
  body: string
  severity?: string
  user_email?: string
  user_username?: string
  event_user_email?: string
  event_user_username?: string
}

interface HTTPRequest {
  args?: Record<string, unknown>
  path?: string
  method?: string
  request_id?: string
  user_agent?: string
}

interface ModelReference {
  pk: string
  app: string
  name: string
  model_name: string
}

// Interface for parsed login event data
export interface LoginEventData {
  auth_method?: string
  http_request?: HTTPRequest
  auth_method_args?: {
    mfa_devices?: ModelReference[]
    known_device?: boolean
  }
  geo?: {
    lat?: number
    long?: number
    city?: string
    country?: string
    continent?: string
  }
  asn?: {
    asn?: number
    as_org?: string
    network?: string
  }
}

export interface LoginFailedEventData {
  stage?: ModelReference
  username?: string
  http_request?: HTTPRequest
}

export interface UserWriteEventData {
  name?: string
  email?: string
  username?: string
  created?: boolean
  attributes?: {
    settings?: {
      locale?: string
    }
  }
  http_request?: HTTPRequest
}

export type FormattedEvent = {
  title: string
  message: string
}

// Tracearr notification types
export type TracearrEventType =
  | "violation_detected"
  | "stream_started"
  | "stream_stopped"
  | "server_down"
  | "server_up"
  | "new_device"
  | "trust_score_changed"

interface TracearrUser {
  id: string
  username: string
  displayName: string
}

interface TracearrRule {
  id: string
  type: string
  name: string
}

interface TracearrViolation {
  id: string
  severity: string
  details: unknown
}

interface TracearrMedia {
  title: string
  subtitle?: string
  type: string
  year?: number
}

interface TracearrPlayback {
  type: string
  quality?: string
  player?: string
}

interface TracearrLocation {
  city?: string
  country?: string
}

interface TracearrSession {
  durationMs?: number
}

export interface TracearrViolationPayload {
  event: "violation_detected"
  timestamp: string
  data: {
    user: TracearrUser
    rule: TracearrRule
    violation: TracearrViolation
  }
}

export interface TracearrStreamStartedPayload {
  event: "stream_started"
  timestamp: string
  data: {
    user: TracearrUser
    media: TracearrMedia
    playback: TracearrPlayback
    location: TracearrLocation
  }
}

export interface TracearrStreamStoppedPayload {
  event: "stream_stopped"
  timestamp: string
  data: {
    user: TracearrUser
    media: TracearrMedia
    session: TracearrSession
  }
}

export interface TracearrServerPayload {
  event: "server_down" | "server_up"
  timestamp: string
  data: {
    serverName: string
    serverType: string
  }
}

export interface TracearrNewDevicePayload {
  event: "new_device"
  timestamp: string
  data: {
    userName: string
    deviceName: string
    platform: string
    location?: string
  }
}

export interface TracearrTrustScorePayload {
  event: "trust_score_changed"
  timestamp: string
  data: {
    userName: string
    previousScore: number
    newScore: number
    reason: string
  }
}

export type TracearrWebhookPayload =
  | TracearrViolationPayload
  | TracearrStreamStartedPayload
  | TracearrStreamStoppedPayload
  | TracearrServerPayload
  | TracearrNewDevicePayload
  | TracearrTrustScorePayload
