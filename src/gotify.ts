type GotifyConfig = {
  url: string
  token: string
}

type GotifyMessage = {
  id: number
  appid: number
  message: string
  title: string
  priority: number
  extras?: Record<string, unknown>
  date: string
}

type GotifyPagedMessages = {
  messages: GotifyMessage[]
  paging: {
    limit: number
    offset: number
    since: number
    size: number
  }
}

type GotifyApplication = {
  id: number
  token: string
  name: string
  description: string
  internal: boolean
  image: string
}

export class Gotify {
  private url: string

  private token: string

  constructor({ url, token }: GotifyConfig) {
    this.url = url
    this.token = token
  }

  public async sendMessage(
    title: string,
    message: string,
    priority: number,
    extras?: Record<string, unknown>,
  ): Promise<number> {
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
        extras: { "client::display": { contentType: "text/markdown" }, ...extras },
      }),
    })
    const data = (await result.json()) as { id: number }
    return data.id
  }

  public async deleteMessage(messageId: number, clientToken: string): Promise<void> {
    const response = await fetch(`${this.url}/message/${messageId}`, {
      method: "DELETE",
      headers: { "X-Gotify-Key": clientToken },
    })
    if (!response.ok) {
      throw new Error(`Failed to delete Gotify message ${messageId}: HTTP ${response.status}`)
    }
  }

  public async getApplicationByName(name: string, clientToken: string): Promise<GotifyApplication | undefined> {
    const response = await fetch(`${this.url}/application`, {
      headers: { "X-Gotify-Key": clientToken },
    })
    if (!response.ok) {
      throw new Error(`Failed to list Gotify applications: HTTP ${response.status}`)
    }
    const apps = (await response.json()) as GotifyApplication[]
    return apps.find((app) => app.name === name)
  }

  public async getApplicationMessages(appId: number, clientToken: string): Promise<GotifyMessage[]> {
    const response = await fetch(`${this.url}/application/${appId}/message`, {
      headers: { "X-Gotify-Key": clientToken },
    })
    if (!response.ok) {
      throw new Error(`Failed to list Gotify messages for app ${appId}: HTTP ${response.status}`)
    }
    const data = (await response.json()) as GotifyPagedMessages
    return data.messages
  }
}
