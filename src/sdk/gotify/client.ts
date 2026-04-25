// /application/{id}/message
// Return all messages from a specific application.

import { Message, Paging } from "./types"

const BASE_URL = `${process.env.GOTIFY_URL}/`
const USER_TOKEN = process.env.GOTIFY_WUD_USER_TOKEN

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  console.log(`Requesting ${BASE_URL}${path} with options:`, options)
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      headers: {
        "Content-Type": "application/json",
        "X-Gotify-Key": (process.env.GOTIFY_WUD_APP_TOKEN as string) || "",
        ...(options?.headers || {}),
      },
      ...options,
    })
    if (!res.ok) {
      const text = await res.text()
      console.log("Response not OK:", res.status, text)

      throw new Error(`HTTP ${res.status}: ${text}`)
    }
    return res.json()
  } catch (error) {
    console.error(`Failed to fetch ${BASE_URL}${path}:`, error)
  }
  throw new Error(`Failed to fetch ${BASE_URL}${path}`)
}

const appId = process.env.GOTIFY_WUD_APP_ID
export const getApplicationMessages = () => request<Paging<Message>>(`application/${appId}/message?token=${USER_TOKEN}`, {})

export const deleteMessage = (id: number) => request(`message/${id}`, { method: "delete" })
