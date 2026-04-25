import { Container } from "./types"

const BASE_URL = `${process.env.WUD_URL}/api`

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
    ...options,
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`HTTP ${res.status}: ${text}`)
  }

  return res.json()
}

export interface ContainerActionResponse {
  success: boolean
  message?: string
}

export interface TriggerExecution {
  id: string
  status: "success" | "error" | "pending"
  startedAt: string
  finishedAt?: string
}

export const getContainers = () => request<Container[]>("/containers")

export const getContainer = (id: string) => request<Container>(`/container/${id}`)

export const updateContainer = (id: string) =>
  request<ContainerActionResponse>(`/container/${id}/update`, {
    method: "POST",
  })

export const runTrigger = (id: string) =>
  request<TriggerExecution>(`/trigger/${id}/run`, {
    method: "POST",
  })
