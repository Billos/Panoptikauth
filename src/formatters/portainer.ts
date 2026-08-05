import { TemplatingService } from "../templating"
import { FormattedEvent } from "../types/gotify"
import { PortainerAlert, PortainerWebhookPayload } from "../types/portainer"

const locale = process.env.LOCALE || "en-US"
const timeZone = process.env.TZ || "UTC"

function formatTimestamp(value?: string): string | undefined {
  if (!value) {
    return undefined
  }
  const date = new Date(value)
  if (isNaN(date.getTime())) {
    return value
  }
  return date.toLocaleString(locale, { timeZone })
}

function mapAlert(alert: PortainerAlert) {
  return {
    name: alert.labels?.alertname || "Alert",
    severity: alert.labels?.severity,
    instance: alert.labels?.instance,
    summary: alert.annotations?.summary,
    description: alert.annotations?.description,
    startsAt: alert.status === "firing" ? formatTimestamp(alert.startsAt) : formatTimestamp(alert.endsAt),
    generatorURL: alert.generatorURL,
  }
}

export function formatPortainerEvent(payload: PortainerWebhookPayload): FormattedEvent {
  const templating = new TemplatingService()

  const isFiring = payload.status === "firing"
  const icon = isFiring ? "🔥" : "✅"
  const statusLabel = isFiring ? "Firing" : "Resolved"

  const alerts = (payload.alerts || []).map(mapAlert)

  const alertName = payload.groupLabels?.alertname || payload.commonLabels?.alertname || "Portainer Alert"
  const title = `Portainer ${statusLabel}: ${alertName}`

  const message = templating.render("portainer/alert.njk", {
    icon,
    statusLabel,
    alerts,
    externalURL: payload.externalURL,
  })

  return { title, message }
}
