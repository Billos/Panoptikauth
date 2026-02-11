/**
 * Login event parsing and formatting utilities
 */

import { parse } from "json5"

import { LoginEventData, LoginFailedEventData, UserWriteEventData } from "./types/authentik"

export function isLoginEvent(body: string): boolean {
  return /login:\s*/.test(body)
}

export function isLoginFailedEvent(body: string): boolean {
  return /login_failed:\s*/.test(body)
}

export function isUserWriteEvent(body: string): boolean {
  return /user_write:\s*/.test(body)
}

function getBody(prefix: string, body: string): string {
  const regex = new RegExp(`${prefix}:\\s*(\\{[\\s\\S]*\\})`)
  const match = body.match(regex)

  if (!match) {
    throw new Error(`${prefix} data not found in body`)
  }
  return match[1]
    .trim()
    .replace(/\bTrue\b/g, "true")
    .replace(/\bFalse\b/g, "false")
}

export function parseLoginEvent(body: string): LoginEventData {
  if (!isLoginEvent(body)) {
    throw new Error("Not a login event")
  }
  return parse(getBody("login", body)) as LoginEventData
}

export function parseLoginFailedEvent(body: string): LoginFailedEventData {
  if (!isLoginFailedEvent(body)) {
    throw new Error("Not a login failed event")
  }
  return parse(getBody("login_failed", body)) as LoginFailedEventData
}

export function parseUserWriteEvent(body: string): UserWriteEventData {
  if (!isUserWriteEvent(body)) {
    throw new Error("Not a user write event")
  }
  return parse(getBody("user_write", body)) as UserWriteEventData
}
