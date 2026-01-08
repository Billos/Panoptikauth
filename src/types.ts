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
  client_ip?: string
  context?: {
    geo?: {
      city?: string
      country?: string
      lat?: number
      long?: number
    }
  }
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
  context?: {
    geo?: {
      city?: string
      country?: string
      lat?: number
      long?: number
    }
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
  context?: {
    geo?: {
      city?: string
      country?: string
      lat?: number
      long?: number
    }
  }
}

export type FormattedEvent = {
  title: string
  message: string
}
