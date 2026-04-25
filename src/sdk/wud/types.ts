export interface Container {
  id: string

  name: string
  status: "running" | "stopped" | "unknown"

  watcher: string // ex: "local", "nas", etc
  registry: string // ex: "dockerhub", "ghcr"

  image: Image

  result: UpdateResult

  createdAt: string // ISO date
  updatedAt: string // ISO date
  updateAvailable: boolean

  labels?: Record<string, string>
}

export interface Image {
  name: string // ex: "nginx"
  tag: string // ex: "1.25.3"
  digest?: string

  architecture?: string
  os?: string

  registry?: string // docker.io, ghcr.io...
}

export interface UpdateResult {
  local: VersionInfo
  remote?: VersionInfo

  type?: UpdateType // major | minor | patch | unknown

  checkedAt?: string // ISO date
}

export interface VersionInfo {
  tag: string
  semver?: string

  digest?: string

  createdAt?: string
}

export type UpdateType = "major" | "minor" | "patch" | "prerelease" | "unknown"

export interface ContainerActionResponse {
  success: boolean
  message?: string
}

export interface TriggerExecution {
  id: string
  type: string // docker, slack, smtp, etc.

  status: "success" | "error" | "pending"

  startedAt: string
  finishedAt?: string

  logs?: string[]
}
