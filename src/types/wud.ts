export interface WudImageTag {
  value: string
  semver: boolean
}

export interface WudImageRegistry {
  name: string
  url: string
}

export interface WudImage {
  id: string
  registry: WudImageRegistry
  name: string
  tag: WudImageTag
  architecture?: string
  os?: string
  created?: string
}

export interface WudResult {
  tag?: string
  digest?: string
  created?: string
}

export interface WudContainer {
  id: string
  name: string
  watcher: string
  image: WudImage
  result?: WudResult
  updateAvailable: boolean
}

export type WudWebhookPayload = WudContainer
