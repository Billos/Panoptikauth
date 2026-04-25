export interface Paging<T> {
  messages: T[]
  paging: {
    limit: number
    next?: string
    since?: number
    size: number
  }
}

export interface Message {
  appid: number
  date: string
  extras: Record<string, any>
  id: number
  message: string
  priority: number
  title: string
}
