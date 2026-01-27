import axios, { AxiosInstance } from "axios"

type GotifyConfig = {
  url: string
  token: string
}

export class Gotify {
  private request: AxiosInstance | null = null

  private url: string

  private token: string

  constructor({ url, token }: GotifyConfig) {
    this.url = url
    this.token = token
    this.request = axios.create({ baseURL: this.url, headers: { "X-Gotify-Key": this.token } })
  }

  public async sendMessage(title: string, message: string, priority: number): Promise<string> {
    if (!this.request) {
      throw new Error("Gotify client not initialized")
    }
    const result = await this.request.post<{ id: number }>("/message", {
      title,
      message,
      priority,
      extras: { "client::display": { contentType: "text/markdown" } },
    })
    return `${result.data.id}`
  }
}
