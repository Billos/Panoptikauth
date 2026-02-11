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
