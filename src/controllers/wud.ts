import { Request, Response } from "express"

import { deleteMessage, getApplicationMessages } from "../sdk/gotify/client"
import { getContainers } from "../sdk/wud/client"
import { FormattedEvent } from "../types/gotify"

export async function handleWudRequest(_req: Request<{}, {}, {}>, res: Response<{}, { data: FormattedEvent }>) {
  try {
    console.log("Handling WUD request")
    const appMessages = await getApplicationMessages()
    console.log(`Fetched ${appMessages.messages.length} messages from Gotify`)
    const containers = await getContainers()
    console.log(`Fetched ${containers.length} containers from WUD`)
    const upToDateContainers = containers.filter((c) => !c.updateAvailable)
    console.log(`Found ${upToDateContainers.length} up-to-date containers`)

    for (const container of upToDateContainers) {
      const messages = appMessages.messages.filter((m) => m.message.includes(container.name))
      if (messages.length === 0) {
        continue
      }
      console.log(`Found ${messages.length} notifications for container ${container.name}`)
      for (const message of messages) {
        try {
          await deleteMessage(message.id)
          console.log(`Deleted message ${message.id} for container ${container.name}`)
        } catch (error) {
          console.error(`Failed to delete message ${message.id} for container ${container.name}:`, error)
        }
      }
    }

    console.log("WUD request handled successfully")
    return res.status(200).send("OK")
  } catch (error) {
    console.error("Failed to handle WUD request:", error)
    return res.status(500).send("Internal Server Error")
  }
}
