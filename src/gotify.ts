import axios, { AxiosInstance } from "axios"

const GOTIFY_URL = process.env.GOTIFY_URL;
const GOTIFY_TOKEN = process.env.GOTIFY_TOKEN;

export class Gotify  {
  private request: AxiosInstance = axios.create({ baseURL: GOTIFY_URL, headers: { "X-Gotify-Key": GOTIFY_TOKEN } })

  public async sendMessage(title: string, message: string, priority: number): Promise<string> {

    if (!GOTIFY_URL || !GOTIFY_TOKEN) {
      throw new Error("Gotify configuration is missing")
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