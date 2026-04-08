type GotifyConfig = {
  url: string
  token: string
}

export class Gotify {
  private url: string

  private token: string

  constructor({ url, token }: GotifyConfig) {
    this.url = url
    this.token = token
  }

  public async sendMessage(title: string, message: string, priority: number): Promise<string> {
    if (!this.url || !this.token) {
      throw new Error("Gotify client not initialized")
    }
    const result = await fetch(`${this.url}/message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Gotify-Key": this.token,
      },
      body: JSON.stringify({
        title,
        message,
        priority,
        extras: { "client::display": { contentType: "text/markdown" } },
      }),
    })
    const data = (await result.json()) as { id: string }
    return data.id
  }
}
