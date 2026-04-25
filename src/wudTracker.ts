export type TrackedWudUpdate = {
  messageId: number
  gotifyUrl: string
}

const tracked = new Map<string, TrackedWudUpdate>()

export function trackWudUpdate(containerId: string, data: TrackedWudUpdate): void {
  tracked.set(containerId, data)
}

export function untrackWudUpdate(containerId: string): void {
  tracked.delete(containerId)
}

export function getTrackedWudUpdates(): ReadonlyMap<string, TrackedWudUpdate> {
  return tracked
}
