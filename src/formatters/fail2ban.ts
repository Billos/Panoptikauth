import { TemplatingService } from "../templating"
import { Fail2banBanEntry } from "../types/fail2ban"
import { FormattedEvent } from "../types/gotify"

const locale = process.env.LOCALE || "en-US"
const timeZone = process.env.TZ || "UTC"

export function formatFail2banBans(entries: Fail2banBanEntry[]): FormattedEvent {
  const templating = new TemplatingService()
  const title = `🚫 fail2ban: ${entries.length} IP${entries.length > 1 ? "s" : ""} banned`
  const message = templating.render("fail2ban/banned.njk", {
    entries: entries.map((e) => ({
      ...e,
      bannedAt: new Date(e.bannedAt).toLocaleString(locale, { timeZone }),
    })),
  })
  return { title, message, priority: 5 }
}
