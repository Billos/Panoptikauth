import { Request, Response } from "express"

import { deleteMessage, getApplicationMessages } from "../sdk/gotify/client"
import { getContainers } from "../sdk/wud/client"
import { FormattedEvent } from "../types/gotify"

export async function handleWudRequest(_req: Request<{}, {}, {}>, res: Response<{}, { data: FormattedEvent }>) {
  console.log("=")

  const appMessages = await getApplicationMessages()
  const containers = await getContainers()
  const upToDateContainers = containers.filter((c) => !c.updateAvailable)

  for (const container of upToDateContainers) {
    const messages = appMessages.messages.filter((m) => m.message.includes(container.name))
    if (messages.length === 0) {
      continue
    }
    console.log(`Found ${messages.length} notifications for container ${container.name}`)
    for (const message of messages) {
      try {
        await deleteMessage(message.id)
      } catch (error) {
        console.error(`Failed to delete message ${message.id} for container ${container.name}:`, error)
      }
    }
  }

  return res.status(200).send("OK")
}
