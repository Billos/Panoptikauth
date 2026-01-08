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

// Interface for parsed login event data
export interface LoginEventData {
  auth_method?: string
  http_request?: {
    args?: { next?: string }
    path?: string
    method?: string
    request_id?: string
    user_agent?: string
  }
  auth_method_args?: {
    mfa_devices?: Array<{ pk: number; app: string; name: string; model_name: string }>
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
  stage?: {
    pk: string
    app: string
    name: string
    model_name: string
  }
  username?: string
  http_request?: {
    args?: { next?: string }
    path?: string
    method?: string
    request_id?: string
    user_agent?: string
  }
}

export type FormattedEvent = {
  title: string
  message: string
}
