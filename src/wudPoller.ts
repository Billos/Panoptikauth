import { Gotify } from "./gotify"
import { WudContainer } from "./types/wud"
import { getTrackedWudUpdates, trackWudUpdate, untrackWudUpdate } from "./wudTracker"

const DEFAULT_POLL_INTERVAL_SECONDS = 300

const { WUD_URL } = process.env
const { WUD_POLL_INTERVAL } = process.env
const { GOTIFY_URL } = process.env
const { GOTIFY_CLIENT_TOKEN } = process.env
const WUD_POLL_INTERVAL_MS = parseInt(WUD_POLL_INTERVAL || String(DEFAULT_POLL_INTERVAL_SECONDS), 10) * 1000
const { WUD_GOTIFY_APP_NAME = "wud" } = process.env

async function fetchWudContainer(containerId: string): Promise<WudContainer | null> {
  try {
    const response = await fetch(`${WUD_URL}/api/containers/${containerId}`)
    if (response.status === 404) return null
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return (await response.json()) as WudContainer
  } catch (error) {
    console.error(`WUD poller: failed to fetch container ${containerId}:`, error)
    return null
  }
}

async function poll(): Promise<void> {
  const tracked = getTrackedWudUpdates()
  if (tracked.size === 0) return

  console.log(`WUD poller: checking ${tracked.size} tracked container(s)...`)

  for (const [containerId, { messageId, gotifyUrl }] of tracked) {
    const container = await fetchWudContainer(containerId)
    const stillPending = container !== null && container.updateAvailable

    if (!stillPending) {
      console.log(`WUD poller: container ${containerId} update resolved, removing Gotify notification ${messageId}`)
      if (GOTIFY_CLIENT_TOKEN) {
        try {
          const gotify = new Gotify({ url: gotifyUrl, token: "" })
          await gotify.deleteMessage(messageId, GOTIFY_CLIENT_TOKEN)
          console.log(`WUD poller: deleted Gotify message ${messageId} for container ${containerId}`)
        } catch (error) {
          console.error(`WUD poller: failed to delete Gotify message ${messageId}:`, error)
        }
      } else {
        console.warn("WUD poller: GOTIFY_CLIENT_TOKEN not set, cannot delete Gotify message")
      }
      untrackWudUpdate(containerId)
    }
  }
}

async function restoreFromGotify(): Promise<void> {
  if (!GOTIFY_URL || !GOTIFY_CLIENT_TOKEN) {
    console.log("WUD poller: GOTIFY_URL or GOTIFY_CLIENT_TOKEN not set, skipping state restore")
    return
  }

  try {
    const gotify = new Gotify({ url: GOTIFY_URL, token: "" })
    const app = await gotify.getApplicationByName(WUD_GOTIFY_APP_NAME, GOTIFY_CLIENT_TOKEN)
    if (!app) {
      console.log(`WUD poller: no Gotify app named '${WUD_GOTIFY_APP_NAME}' found, skipping restore`)
      return
    }

    const messages = await gotify.getApplicationMessages(app.id, GOTIFY_CLIENT_TOKEN)
    let restored = 0
    for (const msg of messages) {
      const wudExtras = msg.extras?.["panoptikauth::wud"] as { containerId?: string } | undefined
      if (wudExtras?.containerId) {
        trackWudUpdate(wudExtras.containerId, { messageId: msg.id, gotifyUrl: GOTIFY_URL })
        restored++
      }
    }
    if (restored > 0) {
      console.log(`WUD poller: restored ${restored} tracked update(s) from Gotify`)
    }
  } catch (error) {
    console.error("WUD poller: failed to restore state from Gotify:", error)
  }
}

export function startWudPoller(): void {
  if (!WUD_URL) {
    console.log("WUD_URL not set, WUD poller disabled")
    return
  }

  console.log(`WUD poller starting (interval: ${WUD_POLL_INTERVAL_MS / 1000}s, app: '${WUD_GOTIFY_APP_NAME}')`)
  restoreFromGotify().then(() => {
    poll().catch((err) => console.error("WUD poller: unexpected error:", err))
    setInterval(() => {
      poll().catch((err) => console.error("WUD poller: unexpected error:", err))
    }, WUD_POLL_INTERVAL_MS)
  })
}
