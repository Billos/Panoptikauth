import { TemplatingService } from "../templating"
import { FormattedEvent } from "../types/gotify"
import { WudContainer } from "../types/wud"

export function formatWudUpdateEvent(container: WudContainer): FormattedEvent {
  const templating = new TemplatingService()
  const title = `🐳 Update available: ${container.name}`
  const message = templating.render("wud/update.njk", {
    containerName: container.name,
    watcher: container.watcher,
    imageName: container.image.name,
    currentTag: container.image.tag.value,
    newTag: container.result?.tag ?? "unknown",
  })
  return { title, message, priority: 5 }
}
