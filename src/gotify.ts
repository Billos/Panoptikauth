import axios, { AxiosInstance } from "axios"

export class Gotify {
  private request: AxiosInstance | null = null

  constructor(
    private url: string,
    private token: string,
  ) {
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
